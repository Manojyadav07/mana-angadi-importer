
-- Create onboarding_applications table
CREATE TABLE IF NOT EXISTS public.onboarding_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'merchant',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT onboarding_applications_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own application
CREATE POLICY "Users view own application"
  ON public.onboarding_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own application
CREATE POLICY "Users insert own application"
  ON public.onboarding_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all applications (admin = role 'admin' in user_roles)
CREATE POLICY "Admin view all applications"
  ON public.onboarding_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Admin can update any application
CREATE POLICY "Admin update applications"
  ON public.onboarding_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Admin can view all profiles
CREATE POLICY "Admin view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Admin can update any profile (to set role on approval)
CREATE POLICY "Admin update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Admin can update user_roles (to set merchant role)
CREATE POLICY "Admin update user roles"
  ON public.user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_onboarding_applications_updated_at
  BEFORE UPDATE ON public.onboarding_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_updated_at();
