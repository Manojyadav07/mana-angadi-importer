-- Fix permissive INSERT policy on onboarding_requests
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can submit onboarding requests" ON public.onboarding_requests;

-- Create a more restrictive policy - only authenticated users can submit
CREATE POLICY "Authenticated users can submit onboarding requests" 
ON public.onboarding_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);