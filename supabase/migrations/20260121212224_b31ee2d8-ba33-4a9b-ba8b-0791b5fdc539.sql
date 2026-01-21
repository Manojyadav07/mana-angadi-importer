-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Create policy for viewing product images (public)
CREATE POLICY "Product images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Create policy for merchants to upload product images
CREATE POLICY "Merchants can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for merchants to update their product images
CREATE POLICY "Merchants can update their product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for merchants to delete their product images
CREATE POLICY "Merchants can delete their product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IS NOT NULL
);