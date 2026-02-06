import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useOrder } from '@/hooks/useOrders';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, XCircle, Loader2 } from 'lucide-react';
import { OrderStatus } from '@/types';
import { LiveTrackingCard } from '@/components/tracking/LiveTrackingCard';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import { HelpSupportButton } from '@/components/order/HelpSupportButton';
import { ETADisplay } from '@/components/order/ETADisplay';
import { ReorderButton } from '@/components/order/ReorderButton';

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

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const { data: order, isLoading } = useOrder(orderId);
  
  const showLiveTracking = order && ['assigned', 'pickedUp', 'onTheWay'].includes(order.status);
  const showETA = order && ['assigned', 'pickedUp', 'onTheWay'].includes(order.status);
  const showReorder = order?.status === 'delivered';

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

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">{t.orderNotFound}</p>
        </div>
      </MobileLayout>
    );
  }

  const isRejected = order.status === 'rejected';
  const shopName = language === 'en' ? order.shopName_en : order.shopName_te;
  const rejectionReason = language === 'en' ? order.rejectionReason_en : order.rejectionReason_te;

  return (
    <MobileLayout>
      <header className="screen-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="font-bold text-lg text-foreground">{t.orderId} #{order.id.slice(0, 8)}</h1>
              <p className="text-muted-foreground text-sm">{shopName}</p>
            </div>
          </div>
          <HelpSupportButton orderId={order.id} />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.currentStatus}</span>
            <span className={statusClasses[order.status]}>{getStatusLabel(order.status)}</span>
          </div>
          {isRejected && rejectionReason && (
            <p className="text-sm text-destructive mt-2">{rejectionReason}</p>
          )}
        </div>

        {showETA && <ETADisplay order={order} />}

        {!isRejected && (
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">{t.orderTimeline}</h3>
            <OrderTimeline order={order} />
          </div>
        )}

        {showLiveTracking && (
          <LiveTrackingCard 
            orderId={order.id} 
            pickupLat={order.pickupLatSnapshot}
            pickupLng={order.pickupLngSnapshot}
            dropLat={order.dropLatSnapshot}
            dropLng={order.dropLngSnapshot}
          />
        )}

        {isRejected && (
          <div className="bg-destructive/10 rounded-2xl border border-destructive/20 p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">{t.statusRejected}</p>
                {rejectionReason && <p className="text-sm text-muted-foreground">{rejectionReason}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">{t.orderDetails}</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">{language === 'en' ? item.productName_en : item.productName_te}</p>
                  <p className="text-sm text-muted-foreground">₹{item.price} × {item.quantity}</p>
                </div>
                <p className="font-medium text-foreground">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
            <span className="font-semibold text-foreground">{t.total}</span>
            <span className="text-xl font-bold text-primary">₹{order.total}</span>
          </div>
        </div>

        {showReorder && <ReorderButton order={order} />}

        <div className="bg-primary/10 rounded-2xl p-4">
          <p className="text-sm text-center text-foreground">🔒 {t.privacyNote}</p>
        </div>
      </div>
    </MobileLayout>
  );
}
