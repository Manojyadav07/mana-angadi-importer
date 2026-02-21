import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { X, ShoppingBag, Store } from 'lucide-react';
import { toast } from 'sonner';
import type { BrowseItem } from '@/hooks/useBrowse';

interface ItemDetailSheetProps {
  item: BrowseItem | null;
  onClose: () => void;
}

export function ItemDetailSheet({ item, onClose }: ItemDetailSheetProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!item) return null;

  const handleAddToCart = async () => {
    if (!user) {
      sessionStorage.setItem('post-login-redirect', '/');
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase.from('cart_items').insert({
        user_id: user.id,
        item_id: item.id,
        shop_id: item.shop_id,
        quantity: 1,
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(language === 'te' ? 'బుట్టకు జోడించబడింది' : 'Added to basket');
      onClose();
    } catch (err: any) {
      console.error('[addToCart]', err);
      toast.error(language === 'te' ? 'లోపం సంభవించింది' : 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-w-md w-full bg-card rounded-t-2xl p-6 pb-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        <h2 className="text-xl font-semibold text-foreground pr-8">{item.name}</h2>

        <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
          <Store className="w-4 h-4" />
          <span>{item.shop_name ?? 'Shop'}</span>
        </div>

        <p className="text-2xl font-bold text-foreground mt-4">₹{item.price}</p>

        <button
          onClick={handleAddToCart}
          className="btn-primary-block mt-6 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>
            {user
              ? (language === 'te' ? 'బుట్టకు జోడించు' : 'Add to Basket')
              : (language === 'te' ? 'లాగిన్ & జోడించు' : 'Login & Add to Basket')}
          </span>
        </button>
      </div>
    </div>
  );
}
