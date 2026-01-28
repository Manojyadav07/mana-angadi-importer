import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export function useProductImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File, shopId: string): Promise<string | null> => {
    if (!file) return null;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, WebP, or GIF)');
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image must be less than 5MB');
      return null;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${shopId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      setProgress(100);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/product-images\/(.+)$/);
      if (!pathMatch) return false;

      const filePath = pathMatch[1];

      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Image delete error:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    progress
  };
}
