
-- Auth Hook: provision profile + role on first token mint
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _phone   text;
BEGIN
  _user_id := (event -> 'user_id')::text::uuid;
  _phone   := event -> 'claims' ->> 'phone';

  -- Ensure profile exists
  INSERT INTO public.profiles (user_id, phone)
  VALUES (_user_id, _phone)
  ON CONFLICT (user_id) DO NOTHING;

  -- Ensure role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;

  -- Return claims unmodified
  RETURN event;
END;
$$;

-- Grant execute to supabase_auth_admin (required for auth hooks)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- Revoke from public
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM public;

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
