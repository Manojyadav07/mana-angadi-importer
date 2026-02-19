import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/hooks/useCart';
import { Order } from '@/types';
import { getProductsByShopId } from '@/data/mockData';
import { toast } from 'sonner';

interface ReorderButtonProps {
  order: Order;
  variant?: 'full' | 'compact';
  className?: string;
}

export function ReorderButton({ order, variant = 'full', className = '' }: ReorderButtonProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { addToCart, clearCart } = useCart();

  const texts = {
    orderAgain: language === 'en' ? 'Order Again' : 'మళ్ళీ ఆర్డర్ చేయండి',
    someUnavailable: language === 'en' 
      ? 'Some items are not available right now' 
      : 'కొన్ని ఐటెమ్స్ ఇప్పుడు లభ్యం కావు',
    allUnavailable: language === 'en'
      ? 'All items are currently unavailable'
      : 'అన్ని ఐటెమ్స్ ఇప్పుడు లభ్యం కావు',
  };

  const handleReorder = () => {
    const shopProducts = getProductsByShopId(order.shopId);
    
    clearCart();

    let addedCount = 0;
    let unavailableCount = 0;

    order.items.forEach(item => {
      const product = shopProducts.find(
        p => p.id === item.productId && p.isActive && p.inStock
      );
      
      if (product) {
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
        addedCount++;
      } else {
        unavailableCount++;
      }
    });

    if (addedCount === 0) {
      toast.error(texts.allUnavailable);
      return;
    }

    if (unavailableCount > 0) {
      toast.warning(texts.someUnavailable);
    }

    navigate('/cart');
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleReorder}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium active:scale-[0.98] transition-transform ${className}`}
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {texts.orderAgain}
      </button>
    );
  }

  return (
    <button
      onClick={handleReorder}
      className={`btn-primary w-full flex items-center justify-center gap-2 ${className}`}
    >
      <RefreshCw className="w-5 h-5" />
      {texts.orderAgain}
    </button>
  );
}
