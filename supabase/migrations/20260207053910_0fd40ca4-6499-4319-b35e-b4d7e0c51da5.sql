
-- Table to store phone OTPs
CREATE TABLE public.phone_otps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX idx_phone_otps_phone ON public.phone_otps (phone, verified, expires_at);

-- RLS: only edge functions (service role) access this table
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role can access
