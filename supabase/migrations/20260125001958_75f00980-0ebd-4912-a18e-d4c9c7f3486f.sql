-- Add merchant_status enum and column to profiles for merchant approval workflow
CREATE TYPE public.merchant_status AS ENUM ('pending', 'approved', 'rejected');

-- Add merchant_status to profiles table (null for non-merchants)
ALTER TABLE public.profiles 
ADD COLUMN merchant_status merchant_status DEFAULT NULL;

-- Update RLS policy for profiles to ensure users can always INSERT their own profile
-- First drop the existing insert policy that only allows admins
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Create new insert policy that allows users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Ensure user_roles RLS allows users to manage their own roles properly
-- The current policies look good, but let's add a policy for users to read any role for routing purposes
-- (this is already covered by the existing "Users can view their own roles" policy)