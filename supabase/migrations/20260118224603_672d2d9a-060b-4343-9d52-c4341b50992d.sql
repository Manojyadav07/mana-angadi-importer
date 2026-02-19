-- Create role enum
CREATE TYPE public.app_role AS ENUM ('customer', 'merchant', 'delivery', 'admin');

-- Create shop type enum
CREATE TYPE public.shop_type AS ENUM ('kirana', 'restaurant', 'medical');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('placed', 'accepted', 'ready', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'cancelled');

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('cod', 'upi');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded');

-- Create villages table
CREATE TABLE public.villages (
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

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'te',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name_te TEXT NOT NULL,
  name_en TEXT NOT NULL,
  type public.shop_type NOT NULL DEFAULT 'kirana',
  description_te TEXT,
  description_en TEXT,
  image_url TEXT,
  village_id UUID REFERENCES public.villages(id),
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  upi_vpa TEXT,
  upi_payee_name TEXT,
  is_active BOOLEAN DEFAULT true,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name_te TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_te TEXT,
  description_en TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'piece',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create customer addresses table
CREATE TABLE public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Create delivery fee rules table
CREATE TABLE public.delivery_fee_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_key TEXT DEFAULT 'metlachittapur',
  base_fee_kirana DECIMAL(10,2) DEFAULT 20,
  base_fee_restaurant DECIMAL(10,2) DEFAULT 25,
  base_fee_medical DECIMAL(10,2) DEFAULT 30,
  per_km_fee DECIMAL(10,2) DEFAULT 5,
  free_delivery_min_order DECIMAL(10,2),
  max_fee_cap DECIMAL(10,2) DEFAULT 100,
  min_order_restaurant DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL NOT NULL,
  delivery_person_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.order_status DEFAULT 'placed',
  
  -- Payment
  payment_method public.payment_method DEFAULT 'cod',
  payment_status public.payment_status DEFAULT 'unpaid',
  upi_vpa_used TEXT,
  upi_txn_ref TEXT,
  upi_proof_image_url TEXT,
  cod_change_needed_for INTEGER,
  paid_at TIMESTAMPTZ,
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  approx_distance_km DECIMAL(10,2),
  eta_min INTEGER,
  eta_max INTEGER,
  
  -- Address snapshots
  delivery_address_id UUID REFERENCES public.customer_addresses(id),
  customer_address_text_te TEXT,
  customer_address_text_en TEXT,
  drop_lat DOUBLE PRECISION,
  drop_lng DOUBLE PRECISION,
  delivery_instructions_te TEXT,
  delivery_instructions_en TEXT,
  
  -- Shop snapshots
  shop_name_te_snapshot TEXT,
  shop_name_en_snapshot TEXT,
  shop_pickup_lat DOUBLE PRECISION,
  shop_pickup_lng DOUBLE PRECISION,
  
  -- Customer note
  note TEXT,
  
  -- Timestamps
  placed_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  on_the_way_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  
  -- Product snapshots
  product_name_te_snapshot TEXT NOT NULL,
  product_name_en_snapshot TEXT NOT NULL,
  product_price_snapshot DECIMAL(10,2) NOT NULL,
  product_image_url_snapshot TEXT,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create onboarding requests table (for admin)
CREATE TABLE public.onboarding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type TEXT NOT NULL CHECK (request_type IN ('merchant', 'shop')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  shop_type public.shop_type,
  shop_name_te TEXT,
  shop_name_en TEXT,
  village_id UUID REFERENCES public.villages(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create delivery location updates table
CREATE TABLE public.delivery_location_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  delivery_person_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Helper function to check if user is merchant
CREATE OR REPLACE FUNCTION public.is_merchant(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'merchant')
$$;

-- Helper function to check if user is delivery
CREATE OR REPLACE FUNCTION public.is_delivery(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'delivery')
$$;

-- Helper function to check if user owns a shop
CREATE OR REPLACE FUNCTION public.owns_shop(_user_id UUID, _shop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.shops
    WHERE id = _shop_id
      AND owner_id = _user_id
  )
$$;

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at triggers
CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON public.villages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON public.customer_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_fee_rules_updated_at BEFORE UPDATE ON public.delivery_fee_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_requests_updated_at BEFORE UPDATE ON public.onboarding_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_fee_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_location_updates ENABLE ROW LEVEL SECURITY;

-- Villages policies (readable by all authenticated, writable by admin)
CREATE POLICY "Villages are viewable by all authenticated users" ON public.villages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert villages" ON public.villages FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update villages" ON public.villages FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete villages" ON public.villages FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can insert their own initial role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Shops policies
CREATE POLICY "Active shops are viewable by all authenticated" ON public.shops FOR SELECT TO authenticated USING (is_active = true OR public.owns_shop(auth.uid(), id) OR public.is_admin(auth.uid()));
CREATE POLICY "Merchants can insert their own shops" ON public.shops FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Shop owners can update their shops" ON public.shops FOR UPDATE TO authenticated USING (public.owns_shop(auth.uid(), id) OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete shops" ON public.shops FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Products policies
CREATE POLICY "Active products are viewable by all authenticated" ON public.products FOR SELECT TO authenticated USING (
  is_active = true OR 
  EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()) OR
  public.is_admin(auth.uid())
);
CREATE POLICY "Shop owners can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.shops WHERE shops.id = shop_id AND shops.owner_id = auth.uid()) OR public.is_admin(auth.uid())
);
CREATE POLICY "Shop owners can update their products" ON public.products FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()) OR public.is_admin(auth.uid())
);
CREATE POLICY "Shop owners can delete their products" ON public.products FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid()) OR public.is_admin(auth.uid())
);

-- Customer addresses policies
CREATE POLICY "Users can view their own addresses" ON public.customer_addresses FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert their own addresses" ON public.customer_addresses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own addresses" ON public.customer_addresses FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can delete their own addresses" ON public.customer_addresses FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Delivery fee rules policies
CREATE POLICY "Fee rules are viewable by all authenticated" ON public.delivery_fee_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert fee rules" ON public.delivery_fee_rules FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update fee rules" ON public.delivery_fee_rules FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete fee rules" ON public.delivery_fee_rules FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR 
  delivery_person_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid()) OR
  public.is_admin(auth.uid())
);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authorized users can update orders" ON public.orders FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR 
  delivery_person_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid()) OR
  public.is_admin(auth.uid())
);

-- Order items policies
CREATE POLICY "Order items viewable by order participants" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() OR 
      orders.delivery_person_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid()) OR
      public.is_admin(auth.uid())
    )
  )
);
CREATE POLICY "Users can insert order items for their orders" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
);

-- Onboarding requests policies
CREATE POLICY "Admins can view all onboarding requests" ON public.onboarding_requests FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Anyone can submit onboarding requests" ON public.onboarding_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update onboarding requests" ON public.onboarding_requests FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete onboarding requests" ON public.onboarding_requests FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Delivery location updates policies
CREATE POLICY "Location updates viewable by order participants" ON public.delivery_location_updates FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = delivery_location_updates.order_id 
    AND (
      orders.user_id = auth.uid() OR 
      orders.delivery_person_id = auth.uid() OR
      public.is_admin(auth.uid())
    )
  )
);
CREATE POLICY "Delivery can insert location updates" ON public.delivery_location_updates FOR INSERT TO authenticated WITH CHECK (
  delivery_person_id = auth.uid() OR public.is_admin(auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_shops_owner_id ON public.shops(owner_id);
CREATE INDEX idx_shops_village_id ON public.shops(village_id);
CREATE INDEX idx_products_shop_id ON public.products(shop_id);
CREATE INDEX idx_customer_addresses_user_id ON public.customer_addresses(user_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX idx_orders_delivery_person_id ON public.orders(delivery_person_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_delivery_location_updates_order_id ON public.delivery_location_updates(order_id);

-- Insert default village
INSERT INTO public.villages (name_te, name_en, mandal_te, mandal_en, district_te, district_en, pin_code)
VALUES ('మెట్లచిట్టాపూర్', 'Metlachittapur', 'జడ్చర్ల', 'Jadcherla', 'మహబూబ్‌నగర్', 'Mahabubnagar', '509301');

-- Insert default delivery fee rules
INSERT INTO public.delivery_fee_rules (village_key, base_fee_kirana, base_fee_restaurant, base_fee_medical, per_km_fee, max_fee_cap)
VALUES ('metlachittapur', 20, 25, 30, 5, 100);