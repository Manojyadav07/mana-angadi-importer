-- Enable RLS on villages and allow public read
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read villages"
  ON public.villages FOR SELECT
  USING (true);

-- Only admins can modify villages
CREATE POLICY "Admin can manage villages"
  ON public.villages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );
