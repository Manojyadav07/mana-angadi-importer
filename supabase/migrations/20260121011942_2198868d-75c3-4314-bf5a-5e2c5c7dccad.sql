-- Add policy to allow users to update their own role from 'customer' to another role
-- This is needed during signup flow when the default role is created first, then updated
CREATE POLICY "Users can update their own customer role"
ON public.user_roles
FOR UPDATE
USING (user_id = auth.uid() AND role = 'customer'::app_role)
WITH CHECK (user_id = auth.uid());