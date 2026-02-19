import { useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useProductImageUpload } from '@/hooks/useProductImageUpload';
import { Camera, X, Loader2, ImageIcon } from 'lucide-react';

interface ProductImageUploadProps {
  currentImage?: string;
  shopId: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
}

export function ProductImageUpload({ 
  currentImage, 
  shopId, 
  onImageUploaded, 
  onImageRemoved 
}: ProductImageUploadProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, isUploading } = useProductImageUpload();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);

  const labels = {
    addPhoto: language === 'en' ? 'Add Photo' : 'ఫోటో జోడించండి',
    changePhoto: language === 'en' ? 'Change Photo' : 'ఫోటో మార్చండి',
    uploading: language === 'en' ? 'Uploading...' : 'అప్‌లోడ్ అవుతోంది...',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    const url = await uploadImage(file, shopId);
    if (url) {
      setPreviewUrl(url);
      onImageUploaded(url);
    } else {
      // Revert preview on failure
      setPreviewUrl(currentImage);
    }

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (currentImage) {
      await deleteImage(currentImage);
    }
    setPreviewUrl(undefined);
    onImageRemoved();
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {previewUrl ? (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted">
          <img 
            src={previewUrl} 
            alt="Product" 
            className="w-full h-full object-cover"
          />
          {isUploading ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
              >
                <Camera className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center px-1">
                {labels.addPhoto}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
