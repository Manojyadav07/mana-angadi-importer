-- Add strict unique constraint on user_id (one role per user)
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);