-- ============================================
-- COMPLETE IDEMPOTENT SCHEMA FOR MANA ANGADI
-- ============================================

-- 1. CREATE ENUMS (idempotent - only if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('customer', 'merchant', 'delivery', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.merchant_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.shop_type AS ENUM ('kirana', 'restaurant', 'medical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('placed', 'accepted', 'ready', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('cod', 'upi');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. CREATE TABLES

-- user_roles table (CRITICAL: separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

-- profiles table (auth-linked)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'te',
  merchant_status public.merchant_status,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- villages table
CREATE TABLE IF NOT EXISTS public.villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_te TEXT NOT NULL,
  name_en TEXT NOT NULL,
  mandal_te TEXT,
  mandal_en TEXT,
  district_te TEXT,
  district_en TEXT,
  pin_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID,
  name_te TEXT NOT NULL,
  name_en TEXT NOT NULL,
  type public.shop_type NOT NULL DEFAULT 'kirana',
  description_te TEXT,
  description_en TEXT,
  image_url TEXT,
  is_open BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  upi_vpa TEXT,
  upi_payee_name TEXT,
  village_id UUID REFERENCES public.villages(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name_te TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_te TEXT,
  description_en TEXT,
  price NUMERIC NOT NULL,
  unit TEXT DEFAULT 'piece',
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- customer_addresses table
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label_te TEXT NOT NULL,
  label_en TEXT NOT NULL,
  receiver_name TEXT,
  phone TEXT,
  village_te TEXT DEFAULT 'మెట్లచిట్టాపూర్',
  village_en TEXT DEFAULT 'Metlachittapur',
  house_details_te TEXT,
  house_details_en TEXT,
  landmark_te TEXT NOT NULL,
  landmark_en TEXT NOT NULL,
  area_te TEXT,
  area_en TEXT,
  delivery_instructions_te TEXT,
  delivery_instructions_en TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  shop_id UUID NOT NULL REFERENCES public.shops(id),
  delivery_person_id UUID,
  status public.order_status DEFAULT 'placed',
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  note TEXT,
  shop_name_te_snapshot TEXT,
  shop_name_en_snapshot TEXT,
  customer_address_text_te TEXT,
  customer_address_text_en TEXT,
  delivery_instructions_te TEXT,
  delivery_instructions_en TEXT,
  delivery_address_id UUID REFERENCES public.customer_addresses(id),
  shop_pickup_lat DOUBLE PRECISION,
  shop_pickup_lng DOUBLE PRECISION,
  drop_lat DOUBLE PRECISION,
  drop_lng DOUBLE PRECISION,
  approx_distance_km NUMERIC,
  eta_min INTEGER,
  eta_max INTEGER,
  payment_method public.payment_method DEFAULT 'cod',
  payment_status public.payment_status DEFAULT 'unpaid',
  upi_vpa_used TEXT,
  upi_txn_ref TEXT,
  upi_proof_image_url TEXT,
  cod_change_needed_for INTEGER,
  placed_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  on_the_way_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name_te_snapshot TEXT NOT NULL,
  product_name_en_snapshot TEXT NOT NULL,
  product_price_snapshot NUMERIC NOT NULL,
  product_image_url_snapshot TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- delivery_location_updates table
CREATE TABLE IF NOT EXISTS public.delivery_location_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_person_id UUID,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- delivery_fee_rules table
CREATE TABLE IF NOT EXISTS public.delivery_fee_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_key TEXT DEFAULT 'metlachittapur',
  base_fee_kirana NUMERIC DEFAULT 20,
  base_fee_restaurant NUMERIC DEFAULT 25,
  base_fee_medical NUMERIC DEFAULT 30,
  per_km_fee NUMERIC DEFAULT 5,
  free_delivery_min_order NUMERIC,
  max_fee_cap NUMERIC DEFAULT 100,
  min_order_restaurant NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- onboarding_requests table
CREATE TABLE IF NOT EXISTS public.onboarding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  shop_type public.shop_type,
  shop_name_te TEXT,
  shop_name_en TEXT,
  village_id UUID REFERENCES public.villages(id),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE HELPER FUNCTIONS (SECURITY DEFINER)

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_merchant(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'merchant')
$$;

CREATE OR REPLACE FUNCTION public.is_delivery(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'delivery')
$$;

CREATE OR REPLACE FUNCTION public.owns_shop(_user_id UUID, _shop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shops
    WHERE id = _shop_id AND owner_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. ENABLE RLS ON ALL TABLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_fee_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (drop first for idempotency)

-- user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own initial role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own customer role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can insert their own initial role" ON public.user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own customer role" ON public.user_roles
  FOR UPDATE USING (user_id = auth.uid() AND role = 'customer') WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (is_admin(auth.uid()));

-- profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (is_admin(auth.uid()));

-- villages policies
DROP POLICY IF EXISTS "Villages are viewable by all authenticated users" ON public.villages;
DROP POLICY IF EXISTS "Admins can insert villages" ON public.villages;
DROP POLICY IF EXISTS "Admins can update villages" ON public.villages;
DROP POLICY IF EXISTS "Admins can delete villages" ON public.villages;

CREATE POLICY "Villages are viewable by all authenticated users" ON public.villages
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert villages" ON public.villages
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update villages" ON public.villages
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete villages" ON public.villages
  FOR DELETE USING (is_admin(auth.uid()));

-- shops policies
DROP POLICY IF EXISTS "Active shops are viewable by all authenticated" ON public.shops;
DROP POLICY IF EXISTS "Merchants can insert their own shops" ON public.shops;
DROP POLICY IF EXISTS "Shop owners can update their shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can delete shops" ON public.shops;

CREATE POLICY "Active shops are viewable by all authenticated" ON public.shops
  FOR SELECT USING (is_active = true OR owns_shop(auth.uid(), id) OR is_admin(auth.uid()));

CREATE POLICY "Merchants can insert their own shops" ON public.shops
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Shop owners can update their shops" ON public.shops
  FOR UPDATE USING (owns_shop(auth.uid(), id) OR is_admin(auth.uid()));

CREATE POLICY "Admins can delete shops" ON public.shops
  FOR DELETE USING (is_admin(auth.uid()));

-- products policies
DROP POLICY IF EXISTS "Active products are viewable by all authenticated" ON public.products;
DROP POLICY IF EXISTS "Shop owners can insert products" ON public.products;
DROP POLICY IF EXISTS "Shop owners can update their products" ON public.products;
DROP POLICY IF EXISTS "Shop owners can delete their products" ON public.products;

CREATE POLICY "Active products are viewable by all authenticated" ON public.products
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Shop owners can insert products" ON public.products
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Shop owners can update their products" ON public.products
  FOR UPDATE USING (EXISTS (SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Shop owners can delete their products" ON public.products
  FOR DELETE USING (EXISTS (SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()) OR is_admin(auth.uid()));

-- customer_addresses policies
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.customer_addresses;

CREATE POLICY "Users can view their own addresses" ON public.customer_addresses
  FOR SELECT USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can insert their own addresses" ON public.customer_addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own addresses" ON public.customer_addresses
  FOR UPDATE USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own addresses" ON public.customer_addresses
  FOR DELETE USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Authorized users can update orders" ON public.orders;

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    user_id = auth.uid() OR 
    delivery_person_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid()) OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authorized users can update orders" ON public.orders
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    delivery_person_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid()) OR 
    is_admin(auth.uid())
  );

-- order_items policies
DROP POLICY IF EXISTS "Order items viewable by order participants" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items for their orders" ON public.order_items;

CREATE POLICY "Order items viewable by order participants" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (
        orders.user_id = auth.uid() OR 
        orders.delivery_person_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid()) OR 
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Users can insert order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- delivery_location_updates policies
DROP POLICY IF EXISTS "Location updates viewable by order participants" ON public.delivery_location_updates;
DROP POLICY IF EXISTS "Delivery can insert location updates" ON public.delivery_location_updates;

CREATE POLICY "Location updates viewable by order participants" ON public.delivery_location_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = delivery_location_updates.order_id AND (
        orders.user_id = auth.uid() OR 
        orders.delivery_person_id = auth.uid() OR 
        is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Delivery can insert location updates" ON public.delivery_location_updates
  FOR INSERT WITH CHECK (delivery_person_id = auth.uid() OR is_admin(auth.uid()));

-- delivery_fee_rules policies
DROP POLICY IF EXISTS "Fee rules are viewable by all authenticated" ON public.delivery_fee_rules;
DROP POLICY IF EXISTS "Admins can insert fee rules" ON public.delivery_fee_rules;
DROP POLICY IF EXISTS "Admins can update fee rules" ON public.delivery_fee_rules;
DROP POLICY IF EXISTS "Admins can delete fee rules" ON public.delivery_fee_rules;

CREATE POLICY "Fee rules are viewable by all authenticated" ON public.delivery_fee_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert fee rules" ON public.delivery_fee_rules
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update fee rules" ON public.delivery_fee_rules
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete fee rules" ON public.delivery_fee_rules
  FOR DELETE USING (is_admin(auth.uid()));

-- onboarding_requests policies
DROP POLICY IF EXISTS "Admins can view all onboarding requests" ON public.onboarding_requests;
DROP POLICY IF EXISTS "Authenticated users can submit onboarding requests" ON public.onboarding_requests;
DROP POLICY IF EXISTS "Admins can update onboarding requests" ON public.onboarding_requests;
DROP POLICY IF EXISTS "Admins can delete onboarding requests" ON public.onboarding_requests;

CREATE POLICY "Admins can view all onboarding requests" ON public.onboarding_requests
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can submit onboarding requests" ON public.onboarding_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update onboarding requests" ON public.onboarding_requests
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete onboarding requests" ON public.onboarding_requests
  FOR DELETE USING (is_admin(auth.uid()));

-- 6. CREATE TRIGGERS FOR updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shops_updated_at ON public.shops;
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_villages_updated_at ON public.villages;
CREATE TRIGGER update_villages_updated_at
  BEFORE UPDATE ON public.villages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_addresses_updated_at ON public.customer_addresses;
CREATE TRIGGER update_customer_addresses_updated_at
  BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_fee_rules_updated_at ON public.delivery_fee_rules;
CREATE TRIGGER update_delivery_fee_rules_updated_at
  BEFORE UPDATE ON public.delivery_fee_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_requests_updated_at ON public.onboarding_requests;
CREATE TRIGGER update_onboarding_requests_updated_at
  BEFORE UPDATE ON public.onboarding_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();