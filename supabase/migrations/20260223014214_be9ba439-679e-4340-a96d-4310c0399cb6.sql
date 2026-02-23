
-- Enable RLS on delivery_assignments
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;

-- Delivery partners can view their own assignments
CREATE POLICY "Delivery partner view own assignments"
  ON public.delivery_assignments FOR SELECT
  USING (auth.uid() = delivery_partner_id);

-- Delivery partners can update their own assignments (status changes)
CREATE POLICY "Delivery partner update own assignments"
  ON public.delivery_assignments FOR UPDATE
  USING (auth.uid() = delivery_partner_id);

-- Admin can view all assignments
CREATE POLICY "Admin view all assignments"
  ON public.delivery_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Admin can insert assignments (assigning deliveries)
CREATE POLICY "Admin insert assignments"
  ON public.delivery_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Admin can update assignments
CREATE POLICY "Admin update assignments"
  ON public.delivery_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );
