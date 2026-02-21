import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Order } from '@/types';
import { toast } from 'sonner';

interface ReorderButtonProps {
  order: Order;
  variant?: 'full' | 'compact';
  className?: string;
}

export function ReorderButton({ order, variant = 'full', className = '' }: ReorderButtonProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const texts = {
    orderAgain: language === 'en' ? 'Order Again' : 'మళ్ళీ ఆర్డర్ చేయండి',
    notSupported: language === 'en' ? 'Reorder not yet supported' : 'మళ్ళీ ఆర్డర్ ఇంకా అందుబాటులో లేదు',
  };

  const handleReorder = () => {
    // TODO: implement reorder with items-based cart
    toast.info(texts.notSupported);
    navigate(`/shop/${order.shopId}`);
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
