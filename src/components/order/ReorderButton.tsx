import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
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
  const { addToCart, clearCart } = useApp();

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
    // Get current products for the shop
    const shopProducts = getProductsByShopId(order.shopId);
    
    // Clear existing cart
    clearCart();

    let addedCount = 0;
    let unavailableCount = 0;

    // Try to add each item from the order
    order.items.forEach(item => {
      const product = shopProducts.find(
        p => p.id === item.productId && p.isActive && p.inStock
      );
      
      if (product) {
        // Add product with the same quantity
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
        addedCount++;
      } else {
        unavailableCount++;
      }
    });

    // Show appropriate message
    if (addedCount === 0) {
      toast.error(texts.allUnavailable);
      return;
    }

    if (unavailableCount > 0) {
      toast.warning(texts.someUnavailable);
    }

    // Navigate to cart
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
