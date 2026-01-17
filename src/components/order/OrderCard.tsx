import { Order } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronRight } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const statusClasses: Record<string, string> = {
  placed: 'badge-placed',
  accepted: 'badge-accepted',
  ready: 'badge-ready',
  delivered: 'badge-delivered',
};

export function OrderCard({ order, onClick }: OrderCardProps) {
  const { t, language } = useLanguage();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'placed': return t.statusPlaced;
      case 'accepted': return t.statusAccepted;
      case 'ready': return t.statusReady;
      case 'delivered': return t.statusDelivered;
      default: return status;
    }
  };

  const shopName = language === 'en' ? order.shopName_en : order.shopName_te;

  return (
    <div
      className="shop-card-active"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">
            {shopName}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {t.orderId} #{order.id}
          </p>
          <p className="text-muted-foreground text-sm">
            ₹{order.total}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={statusClasses[order.status]}>
            {getStatusLabel(order.status)}
          </span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
