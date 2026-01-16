import { Order, ORDER_STATUS_LABELS } from '@/types';
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
  return (
    <div
      className="shop-card-active"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">
            {order.shopName}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            ఆర్డర్ #{order.id}
          </p>
          <p className="text-muted-foreground text-sm">
            ₹{order.total}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={statusClasses[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
