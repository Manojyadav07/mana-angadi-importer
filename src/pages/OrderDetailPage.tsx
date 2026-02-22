import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useOrder } from '@/hooks/useOrders';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import { format } from 'date-fns';

const FALLBACK = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=60';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';

  const { data: order, isLoading } = useOrder(orderId);

  const statusLabel = (s: string | null) => {
    const map: Record<string, string> = en
      ? { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' }
      : { pending: 'పెండింగ్', confirmed: 'నిర్ధారించబడింది', preparing: 'తయారవుతోంది', out_for_delivery: 'డెలివరీలో', delivered: 'డెలివరీ అయింది', cancelled: 'రద్దు' };
    return map[s || 'pending'] || s || 'Pending';
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
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-muted-foreground">{en ? 'Order not found' : 'ఆర్డర్ కనుగొనబడలేదు'}</p>
          <button onClick={() => navigate('/orders')} className="btn-primary px-6 py-2">
            {en ? 'Back to Orders' : 'ఆర్డర్లకు తిరిగి'}
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="screen-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-foreground">
              {en ? 'Order' : 'ఆర్డర్'} #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground text-sm">{order.shop_name}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Status */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{en ? 'Status' : 'స్థితి'}</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
              {statusLabel(order.status)}
            </span>
          </div>
          {order.created_at && (
            <p className="text-xs text-muted-foreground mt-2">
              {en ? 'Placed' : 'ఇవ్వబడింది'}: {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">{en ? 'Items' : 'వస్తువులు'}</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.item_image_url || FALLBACK}
                    alt={item.item_name || 'Item'}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm truncate">{item.item_name || 'Item'}</p>
                  <p className="text-xs text-muted-foreground">₹{item.unit_price} × {item.quantity}</p>
                </div>
                <p className="font-medium text-foreground text-sm">₹{item.total_price}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Subtotal' : 'ఉప మొత్తం'}</span>
              <span className="text-foreground">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Delivery Fee' : 'డెలివరీ రుసుము'}</span>
              <span className="text-foreground">₹{order.delivery_fee}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between items-center">
              <span className="font-semibold text-foreground">{en ? 'Total' : 'మొత్తం'}</span>
              <span className="text-xl font-bold text-primary">₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
