
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _phone   text;
BEGIN
  _user_id := (event ->> 'user_id')::uuid;
  _phone   := event -> 'claims' ->> 'phone';

  -- Idempotent profile upsert
  INSERT INTO public.profiles (user_id, phone)
  VALUES (_user_id, _phone)
  ON CONFLICT (user_id) DO NOTHING;

  -- Idempotent default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;

  -- Return event unmodified (required by Supabase auth hook contract)
  RETURN event;
END;
$$;

-- Ensure correct permissions
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
