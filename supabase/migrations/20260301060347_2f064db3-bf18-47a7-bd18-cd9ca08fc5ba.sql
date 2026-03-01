
DROP FUNCTION IF EXISTS public.calculate_order_totals(uuid, numeric);

CREATE OR REPLACE FUNCTION public.calculate_order_totals(
  p_user_id uuid,
  p_subtotal numeric
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_village_id uuid;
  v_delivery_fee numeric;
  v_min_order numeric;
  v_total_amount numeric;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT village_id INTO v_village_id
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF v_village_id IS NULL THEN
    RAISE EXCEPTION 'No village set on your profile. Please update your delivery location.';
  END IF;

  SELECT delivery_fee, min_order
  INTO v_delivery_fee, v_min_order
  FROM public.villages
  WHERE id = v_village_id;

  IF v_delivery_fee IS NULL THEN
    RAISE EXCEPTION 'Village not found. Please update your delivery location.';
  END IF;

  v_total_amount := p_subtotal + v_delivery_fee;

  RETURN jsonb_build_object(
    'delivery_fee', v_delivery_fee,
    'min_order', v_min_order,
    'total_amount', v_total_amount,
    'village_id', v_village_id
  );
END;
$$;
