
-- Create storage bucket for merchant application documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchant-documents', 'merchant-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload their own documents (folder = user_id)
CREATE POLICY "Users upload own merchant docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'merchant-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can view their own documents
CREATE POLICY "Users view own merchant docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'merchant-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Admins can view all merchant docs
CREATE POLICY "Admin view all merchant docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'merchant-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND roles @> ARRAY['admin'::text]
  )
);
