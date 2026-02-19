import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { Order, OrderStatus } from '@/types';
import { Package, Clock, AlertTriangle, Loader2 } from 'lucide-react';

export function AdminOrdersPage() {
  const { language } = useLanguage();
  const { data: orders = [], isLoading } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const labels = {
    title: language === 'en' ? 'Orders' : 'ఆర్డర్లు',
    subtitle: language === 'en' ? 'Monitor all orders' : 'అన్ని ఆర్డర్లను పర్యవేక్షించండి',
    all: language === 'en' ? 'All' : 'అన్నీ',
    ready: language === 'en' ? 'Ready' : 'సిద్ధం',
    assigned: language === 'en' ? 'Assigned' : 'అప్పగించిన',
    onTheWay: language === 'en' ? 'On The Way' : 'వస్తోంది',
    delivered: language === 'en' ? 'Delivered' : 'డెలివరీ అయింది',
    placed: language === 'en' ? 'Placed' : 'నమోదు',
    accepted: language === 'en' ? 'Accepted' : 'అంగీకరించిన',
    noOrders: language === 'en' ? 'No orders found' : 'ఆర్డర్లు కనుగొనబడలేదు',
    delayed: language === 'en' ? 'Delayed' : 'ఆలస్యం',
    customer: language === 'en' ? 'Customer' : 'కస్టమర్',
    shop: language === 'en' ? 'Shop' : 'షాప్',
    delivery: language === 'en' ? 'Delivery' : 'డెలివరీ',
    payment: language === 'en' ? 'Payment' : 'చెల్లింపు',
    cod: language === 'en' ? 'COD' : 'COD',
    upi: language === 'en' ? 'UPI' : 'UPI',
    pending: language === 'en' ? 'Pending' : 'పెండింగ్',
    paid: language === 'en' ? 'Paid' : 'చెల్లించారు',
    unpaid: language === 'en' ? 'Unpaid' : 'చెల్లించలేదు',
  };

  const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: labels.all },
    { value: 'ready', label: labels.ready },
    { value: 'assigned', label: labels.assigned },
    { value: 'onTheWay', label: labels.onTheWay },
    { value: 'delivered', label: labels.delivered },
  ];

  const filteredOrders = orders.filter(o => 
    statusFilter === 'all' || o.status === statusFilter
  );

  const isDelayed = (order: Order) => {
    if (order.status !== 'onTheWay' || !order.onTheWayAt) return false;
    const minutesOnWay = (Date.now() - new Date(order.onTheWayAt).getTime()) / (1000 * 60);
    return minutesOnWay > 30;
  };

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      placed: 'bg-gray-500/10 text-gray-600',
      accepted: 'bg-blue-500/10 text-blue-600',
      rejected: 'bg-red-500/10 text-red-600',
      ready: 'bg-yellow-500/10 text-yellow-600',
      assigned: 'bg-orange-500/10 text-orange-600',
      pickedUp: 'bg-indigo-500/10 text-indigo-600',
      onTheWay: 'bg-purple-500/10 text-purple-600',
      delivered: 'bg-green-500/10 text-green-600',
    };
    return styles[status];
  };

  const getStatusLabel = (status: OrderStatus) => {
    const statusLabels: Record<OrderStatus, string> = {
      placed: labels.placed,
      accepted: labels.accepted,
      rejected: language === 'en' ? 'Rejected' : 'తిరస్కరించిన',
      ready: labels.ready,
      assigned: labels.assigned,
      pickedUp: language === 'en' ? 'Picked Up' : 'పికప్',
      onTheWay: labels.onTheWay,
      delivered: labels.delivered,
    };
    return statusLabels[status];
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending': return labels.pending;
      case 'Paid': return labels.paid;
      case 'Unpaid': return labels.unpaid;
      default: return status;
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      <header className="screen-header">
        <div>
          <h1 className="font-bold text-xl text-foreground">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {orders.filter(o => o.status === 'ready').length}
            </p>
            <p className="text-xs text-muted-foreground">{labels.ready}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {orders.filter(o => ['assigned', 'pickedUp', 'onTheWay'].includes(o.status)).length}
            </p>
            <p className="text-xs text-muted-foreground">{labels.delivery}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {orders.filter(o => isDelayed(o)).length}
            </p>
            <p className="text-xs text-red-500">{labels.delayed}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{labels.noOrders}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-card rounded-2xl border p-4 ${
                  isDelayed(order) ? 'border-red-500' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{order.id.slice(0, 8)}</p>
                      {isDelayed(order) && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          {labels.delayed}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? order.shopName_en : order.shopName_te}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">{labels.payment}</p>
                    <p className="font-medium text-foreground">
                      {order.paymentMethod} • {getPaymentStatusLabel(order.paymentStatus)}
                    </p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold text-primary">₹{order.total}</p>
                  </div>
                </div>

                {order.deliveryPartnerName && (
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs">🏍️</span>
                      </div>
                      <span className="text-sm text-foreground">{order.deliveryPartnerName}</span>
                    </div>
                    {order.onTheWayAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {Math.round((Date.now() - new Date(order.onTheWayAt).getTime()) / 60000)} min
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminBottomNav />
    </div>
  );
}
