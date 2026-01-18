import { Order, OrderStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronRight, Clock } from 'lucide-react';
import { ReorderButton } from './ReorderButton';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const statusClasses: Record<OrderStatus, string> = {
  placed: 'badge-placed',
  accepted: 'badge-accepted',
  ready: 'badge-ready',
  assigned: 'badge-ready',
  pickedUp: 'badge-ready',
  onTheWay: 'badge-ready',
  delivered: 'badge-delivered',
  rejected: 'badge-rejected',
};

export function OrderCard({ order, onClick }: OrderCardProps) {
  const { t, language } = useLanguage();

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'placed': return t.statusPlaced;
      case 'accepted': return t.statusAccepted;
      case 'ready': return t.statusReady;
      case 'assigned': return t.statusAssigned;
      case 'pickedUp': return t.statusPickedUp;
      case 'onTheWay': return t.statusOnTheWay;
      case 'delivered': return t.statusDelivered;
      case 'rejected': return t.statusRejected;
      default: return status;
    }
  };

  const shopName = language === 'en' ? order.shopName_en : order.shopName_te;
  const isDelivered = order.status === 'delivered';

  const formatTime = (date: Date) => {
    try {
      return format(date, 'MMM d, h:mm a');
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm transition-all active:scale-[0.99]">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onClick}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">
            {shopName}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {t.orderId} #{order.id}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-muted-foreground text-xs">
              {formatTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={statusClasses[order.status]}>
              {getStatusLabel(order.status)}
            </span>
            <p className="text-sm font-semibold text-foreground mt-1">
              ₹{order.total}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Reorder button for delivered orders */}
      {isDelivered && (
        <div className="mt-3 pt-3 border-t border-border">
          <ReorderButton order={order} variant="compact" />
        </div>
      )}
    </div>
  );
}
