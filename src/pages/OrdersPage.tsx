import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { SkeletonOrderCard } from '@/components/ui/SkeletonCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCustomerOrders } from '@/hooks/useOrders';
import { Package } from 'lucide-react';
import { format } from 'date-fns';

export function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const { data: orders = [], isLoading } = useCustomerOrders(user?.id);
  const en = language === 'en';

  const statusLabel = (s: string | null) => {
    const map: Record<string, string> = en
      ? { pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' }
      : { pending: 'పెండింగ్', confirmed: 'నిర్ధారించబడింది', preparing: 'తయారవుతోంది', out_for_delivery: 'డెలివరీలో', delivered: 'డెలివరీ అయింది', cancelled: 'రద్దు' };
    return map[s || 'pending'] || s || 'Pending';
  };

  const statusColor = (s: string | null) => {
    if (s === 'delivered') return 'bg-primary/10 text-primary';
    if (s === 'cancelled') return 'bg-destructive/10 text-destructive';
    return 'bg-accent text-accent-foreground';
  };

  return (
    <MobileLayout>
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">{t.myOrders}</h1>
        <p className="text-muted-foreground mt-1">{en ? 'View your order status here' : 'మీ ఆర్డర్ స్థితి ఇక్కడ చూడండి'}</p>
      </header>

      {isLoading ? (
        <div className="px-4 pb-4 space-y-3">
          <SkeletonOrderCard />
          <SkeletonOrderCard />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center text-lg">{t.noOrders}</p>
          <button onClick={() => navigate('/home')} className="btn-primary mt-6">
            {en ? 'Browse Shops' : 'అంగడులు చూడండి'}
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-3">
          {orders.map(order => (
            <button
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
              className="w-full bg-card rounded-xl border border-border shadow-sm p-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-foreground">{order.shop_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    #{order.id.slice(0, 8).toUpperCase()}
                    {order.created_at && ` · ${format(new Date(order.created_at), 'MMM d, h:mm a')}`}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">{en ? 'Total' : 'మొత్తం'}</span>
                <span className="font-bold text-foreground">₹{order.total_amount}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </MobileLayout>
  );
}
