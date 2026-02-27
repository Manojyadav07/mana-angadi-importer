
-- =====================================================
-- FIX 1: Storage — restrict product-images to shop owners
-- =====================================================
DROP POLICY IF EXISTS "Merchants can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can delete their product images" ON storage.objects;

CREATE POLICY "Shop owners upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners update own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  );

-- =====================================================
-- FIX 2: Enable RLS + add policies on notifications
-- =====================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manage notifications"
  ON public.notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- =====================================================
-- FIX 3: Remove permissive settlements INSERT policy
--         and create a SECURITY DEFINER function instead
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users insert settlements" ON public.settlements;

CREATE OR REPLACE FUNCTION public.create_settlement_on_delivery(
  p_order_id uuid,
  p_commission_rate numeric DEFAULT 0.10
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_shop RECORD;
  v_gross numeric;
  v_commission numeric;
  v_net numeric;
BEGIN
  -- Fetch the order (must be delivered)
  SELECT id, shop_id, total_amount, status
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.status != 'delivered' THEN
    RAISE EXCEPTION 'Order is not delivered';
  END IF;

  -- Prevent duplicate settlements
  IF EXISTS (SELECT 1 FROM public.settlements WHERE order_id = p_order_id) THEN
    RETURN; -- already settled
  END IF;

  -- Get shop owner
  SELECT owner_id INTO v_shop
    FROM public.shops
    WHERE id = v_order.shop_id;

  IF NOT FOUND OR v_shop.owner_id IS NULL THEN
    RAISE EXCEPTION 'Shop owner not found';
  END IF;

  -- Calculate
  v_gross := v_order.total_amount;
  v_commission := v_gross * p_commission_rate;
  v_net := v_gross - v_commission;

  INSERT INTO public.settlements (merchant_id, order_id, gross_amount, commission, net_amount)
  VALUES (v_shop.owner_id, p_order_id, v_gross, v_commission, v_net);
END;
$$;
