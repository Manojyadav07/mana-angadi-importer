
-- Create cart_items table
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only manage their own cart
CREATE POLICY "Users can view their own cart"
  ON public.cart_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert into their own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cart"
  ON public.cart_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete from their own cart"
  ON public.cart_items FOR DELETE
  USING (user_id = auth.uid());

-- Updated_at trigger
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Single-shop enforcement trigger: all cart items for a user must belong to the same shop
CREATE OR REPLACE FUNCTION public.enforce_single_shop_cart()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $$
DECLARE
  existing_shop_id uuid;
BEGIN
  SELECT shop_id INTO existing_shop_id
  FROM public.cart_items
  WHERE user_id = NEW.user_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
  LIMIT 1;

  IF existing_shop_id IS NOT NULL AND existing_shop_id != NEW.shop_id THEN
    RAISE EXCEPTION 'Cart can only contain items from one shop. Clear cart first.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_single_shop_cart_trigger
  BEFORE INSERT OR UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_shop_cart();

-- Helper function to clear cart for a user (used before switching shops)
CREATE OR REPLACE FUNCTION public.clear_cart_and_add(
  _user_id uuid,
  _product_id uuid,
  _shop_id uuid,
  _quantity integer DEFAULT 1
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  -- Verify the caller is the user
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM public.cart_items WHERE user_id = _user_id;
  INSERT INTO public.cart_items (user_id, product_id, shop_id, quantity)
  VALUES (_user_id, _product_id, _shop_id, _quantity);
END;
$$;
