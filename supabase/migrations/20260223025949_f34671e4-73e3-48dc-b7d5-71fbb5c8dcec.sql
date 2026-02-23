-- Enable RLS on settlements
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admin manage settlements"
  ON public.settlements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Merchants can view their own settlements
CREATE POLICY "Merchant view own settlements"
  ON public.settlements
  FOR SELECT
  USING (auth.uid() = merchant_id);

-- Delivery partners and customers can insert settlements (on delivery)
CREATE POLICY "Authenticated users insert settlements"
  ON public.settlements
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
