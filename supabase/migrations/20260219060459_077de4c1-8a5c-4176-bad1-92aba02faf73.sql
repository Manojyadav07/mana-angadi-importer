
-- Drop existing INSERT and UPDATE policies
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;

-- Keep SELECT policy (already exists: "Users can view own role")
-- It already uses auth.uid() = user_id, so no change needed.

-- No new INSERT/UPDATE policies for authenticated users.
-- Only service_role (which bypasses RLS) can insert/update roles.
