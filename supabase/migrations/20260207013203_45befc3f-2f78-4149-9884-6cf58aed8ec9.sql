
-- Create onboarding_applications table
CREATE TABLE public.onboarding_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own application
CREATE POLICY "Users can view own application"
  ON public.onboarding_applications FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Users can insert their own application
CREATE POLICY "Users can insert own application"
  ON public.onboarding_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
  ON public.onboarding_applications FOR UPDATE
  USING (is_admin(auth.uid()));

-- Only admins can delete applications
CREATE POLICY "Admins can delete applications"
  ON public.onboarding_applications FOR DELETE
  USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_onboarding_applications_updated_at
  BEFORE UPDATE ON public.onboarding_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fix user_roles RLS: allow users to update their own role (not just customer)
DROP POLICY IF EXISTS "Users can update their own customer role" ON public.user_roles;
CREATE POLICY "Users can update their own role"
  ON public.user_roles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
