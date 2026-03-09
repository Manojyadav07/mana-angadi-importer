import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCustomerOrders, useCancelOrder } from '@/hooks/useOrders';
import { Package, ChevronRight, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { data: orders = [], isLoading } = useCustomerOrders(user?.id);
  const cancelOrder = useCancelOrder();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const en = language === 'en';

  const statusLabel = (s: string | null) => {
    const map: Record<string, { en: string; te: string }> = {
      placed:           { en: 'Placed',           te: 'ఆర్డర్ చేయబడింది' },
      pending:          { en: 'Pending',           te: 'పెండింగ్' },
      confirmed:        { en: 'Confirmed',         te: 'నిర్ధారించబడింది' },
      assigned:         { en: 'Assigned',          te: 'కేటాయించబడింది' },
      preparing:        { en: 'Preparing',         te: 'తయారవుతోంది' },
      picked_up:        { en: 'Picked Up',         te: 'తీసుకున్నారు' },
      out_for_delivery: { en: 'Out for Delivery',  te: 'డెలివరీలో' },
      delivered:        { en: 'Delivered',         te: 'డెలివరీ అయింది' },
      cancelled:        { en: 'Cancelled',         te: 'రద్దు' },
    };
    const key = s || 'pending';
    return map[key] ? (en ? map[key].en : map[key].te) : key;
  };

  const statusStyle = (s: string | null) => {
    if (s === 'delivered')        return 'bg-primary/15 text-primary';
    if (s === 'cancelled')        return 'bg-destructive/15 text-destructive';
    if (s === 'out_for_delivery') return 'bg-blue-500/15 text-blue-600';
    if (s === 'assigned' || s === 'picked_up') return 'bg-orange-500/15 text-orange-600';
    return 'bg-amber-500/15 text-amber-700';
  };

  const canCancel = (s: string | null) => s === 'pending' || s === 'placed';

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success(en ? 'Order cancelled' : 'ఆర్డర్ రద్దు చేయబడింది');
    } catch {
      toast.error(en ? 'Could not cancel order' : 'ఆర్డర్ రద్దు చేయలేకపోయాం');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {en ? 'My Orders' : 'నా ఆర్డర్లు'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {en ? 'Track and manage your orders' : 'మీ ఆర్డర్లను ట్రాక్ చేయండి'}
        </p>
      </div>

      {/* Content */}
      <div className="px-5 pb-32 space-y-3">

        {/* Loading skeletons */}
        {isLoading && [1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-2xl shadow-sm p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            <div className="h-3 bg-muted rounded w-1/3 mb-4" />
            <div className="h-px bg-border mb-3" />
            <div className="h-4 bg-muted rounded w-1/4 ml-auto" />
          </div>
        ))}

        {/* Empty state */}
        {!isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Package className="w-9 h-9 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              {en ? 'No orders yet' : 'ఇంకా ఆర్డర్లు లేవు'}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {en ? 'Your orders will appear here once you place them.' : 'మీరు ఆర్డర్ చేసిన తర్వాత ఇక్కడ కనిపిస్తాయి.'}
            </p>
            <button
              onClick={() => navigate('/home')}
              className="btn-primary-pill px-8 py-3 text-sm font-semibold"
            >
              {en ? 'Browse Shops' : 'అంగడులు చూడండి'}
            </button>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && orders.map(order => (
          <div key={order.id} className="bg-card rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => navigate(`/order/${order.id}`)}
              className="w-full p-5 text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{order.shop_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    #{order.id.slice(0, 8).toUpperCase()}
                    {order.created_at && ` · ${format(new Date(order.created_at), 'MMM d, h:mm a')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-foreground/5 mt-4 pt-4">
                <span className="text-sm text-muted-foreground">{en ? 'Total Amount' : 'మొత్తం'}</span>
                <span className="text-lg font-bold text-foreground">₹{order.total_amount}</span>
              </div>
            </button>

            {/* Cancel button */}
            {canCancel(order.status) && (
              <div className="border-t border-foreground/5 px-5 py-3">
                <button
                  onClick={() => setConfirmDeleteId(order.id)}
                  className="flex items-center gap-2 text-sm text-destructive font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  {en ? 'Cancel Order' : 'ఆర్డర్ రద్దు చేయండి'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirm Cancel Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {en ? 'Cancel Order?' : 'ఆర్డర్ రద్దు చేయాలా?'}
              </h3>
              <button onClick={() => setConfirmDeleteId(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {en
                ? 'This action cannot be undone. Your order will be cancelled.'
                : 'ఈ చర్య రద్దు చేయడం సాధ్యం కాదు. మీ ఆర్డర్ రద్దు అవుతుంది.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 rounded-full border border-border text-sm font-semibold text-foreground"
              >
                {en ? 'Keep Order' : 'ఉంచండి'}
              </button>
              <button
                onClick={() => handleCancel(confirmDeleteId)}
                disabled={cancelOrder.isPending}
                className="flex-1 py-3 rounded-full bg-destructive text-white text-sm font-semibold disabled:opacity-70"
              >
                {cancelOrder.isPending
                  ? (en ? 'Cancelling...' : 'రద్దు చేస్తోంది...')
                  : (en ? 'Yes, Cancel' : 'అవును, రద్దు చేయండి')}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}