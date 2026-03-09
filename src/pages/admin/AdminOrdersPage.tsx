import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useDispatchOrders } from '@/hooks/useDispatchOrders';
import { Order, OrderStatus } from '@/types';
import {
  Package, Clock, AlertTriangle, Loader2, Send,
  RefreshCw, MapPin, Phone,
} from 'lucide-react';

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';
  const { data: orders = [], isLoading, refetch } = useAdminOrders();
  const dispatch = useDispatchOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const statusFilters: { value: OrderStatus | 'all'; label: string; color: string }[] = [
    { value: 'all', label: en ? 'All' : 'అన్నీ', color: '' },
    { value: 'placed', label: en ? 'Placed' : 'నమోదు', color: 'text-gray-600' },
    { value: 'accepted', label: en ? 'Accepted' : 'అంగీకరించిన', color: 'text-blue-600' },
    { value: 'ready', label: en ? 'Ready' : 'సిద్ధం', color: 'text-yellow-600' },
    { value: 'assigned', label: en ? 'Assigned' : 'అప్పగించిన', color: 'text-orange-600' },
    { value: 'onTheWay', label: en ? 'On Way' : 'వస్తోంది', color: 'text-purple-600' },
    { value: 'delivered', label: en ? 'Delivered' : 'డెలివరీ', color: 'text-green-600' },
    { value: 'rejected', label: en ? 'Cancelled' : 'రద్దు', color: 'text-red-600' },
  ];

  const filteredOrders = orders.filter(o =>
    statusFilter === 'all' || o.status === statusFilter
  );

  const isDelayed = (order: Order) => {
    if (order.status !== 'onTheWay' || !order.onTheWayAt) return false;
    return (Date.now() - new Date(order.onTheWayAt).getTime()) / 60000 > 30;
  };

  const getStatusStyle = (status: OrderStatus) => {
    const map: Record<string, string> = {
      placed: 'bg-gray-500/10 text-gray-600',
      accepted: 'bg-blue-500/10 text-blue-600',
      rejected: 'bg-red-500/10 text-red-600',
      ready: 'bg-yellow-500/10 text-yellow-600',
      assigned: 'bg-orange-500/10 text-orange-600',
      pickedUp: 'bg-indigo-500/10 text-indigo-600',
      onTheWay: 'bg-purple-500/10 text-purple-600',
      delivered: 'bg-green-500/10 text-green-600',
    };
    return map[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: OrderStatus) => {
    const map: Record<string, string> = {
      placed: en ? 'Placed' : 'నమోదు',
      accepted: en ? 'Accepted' : 'అంగీకరించిన',
      rejected: en ? 'Cancelled' : 'రద్దు',
      ready: en ? 'Ready' : 'సిద్ధం',
      assigned: en ? 'Assigned' : 'అప్పగించిన',
      pickedUp: en ? 'Picked Up' : 'పికప్',
      onTheWay: en ? 'On The Way' : 'వస్తోంది',
      delivered: en ? 'Delivered' : 'డెలివరీ అయింది',
    };
    return map[status] || status;
  };

  // Summary counts
  const pendingCount = orders.filter(o => o.status === 'placed').length;
  const inDeliveryCount = orders.filter(o => ['assigned', 'pickedUp', 'onTheWay'].includes(o.status)).length;
  const delayedCount = orders.filter(isDelayed).length;

  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 sticky top-0 z-10 bg-background border-b border-foreground/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {en ? 'Admin' : 'అడ్మిన్'}
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              {en ? 'Orders' : 'ఆర్డర్లు'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => dispatch.mutate()}
              disabled={dispatch.isPending || pendingCount === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
            >
              {dispatch.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {en ? 'Dispatch' : 'పంపించు'}
              {pendingCount > 0 && (
                <span className="bg-white/20 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: en ? 'Pending' : 'పెండింగ్', value: pendingCount, color: 'text-amber-600' },
            { label: en ? 'In Delivery' : 'డెలివరీలో', value: inDeliveryCount, color: 'text-purple-600' },
            { label: en ? 'Delayed' : 'ఆలస్యం', value: delayedCount, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1 opacity-70">
                  ({orders.filter(o => o.status === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {en ? 'No orders found' : 'ఆర్డర్లు కనుగొనబడలేదు'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const delayed = isDelayed(order);
              const expanded = expandedOrder === order.id;
              return (
                <div
                  key={order.id}
                  className={`bg-card rounded-2xl shadow-sm overflow-hidden ${
                    delayed ? 'ring-1 ring-red-500' : ''
                  }`}
                >
                  {/* Order Header */}
                  <button
                    className="w-full p-4 text-left"
                    onClick={() => setExpandedOrder(expanded ? null : order.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          {delayed && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              {en ? 'Delayed' : 'ఆలస్యం'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {en ? order.shopName_en : order.shopName_te}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString(en ? 'en-IN' : 'te-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <p className="text-sm font-bold text-primary">₹{order.total}</p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-foreground/5">
                      <div className="grid grid-cols-2 gap-3 pt-3">
                        <div className="bg-muted/40 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {en ? 'Payment' : 'చెల్లింపు'}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {order.paymentMethod}
                          </p>
                          <p className={`text-xs font-medium ${
                            order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {order.paymentStatus}
                          </p>
                        </div>
                        <div className="bg-muted/40 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {en ? 'Amount' : 'మొత్తం'}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            ₹{order.subtotal} + ₹{order.deliveryFee}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {en ? 'subtotal + delivery' : 'సబ్‌టోటల్ + డెలివరీ'}
                          </p>
                        </div>
                      </div>

                      {/* Delivery address if available */}
                      {(order as any).deliveryAddress && (
                        <div className="flex items-start gap-2 bg-muted/40 rounded-xl p-3">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground">{(order as any).deliveryAddress}</p>
                        </div>
                      )}

                      {/* Delivery phone if available */}
                      {(order as any).deliveryPhone && (
                        <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-3">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-foreground">{(order as any).deliveryPhone}</p>
                        </div>
                      )}

                      {/* Delivery partner */}
                      {order.deliveryPartnerId && (
                        <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-3">
                          <span className="text-base">🏍️</span>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {en ? 'Delivery Partner' : 'డెలివరీ పార్ట్‌నర్'}
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {(order as any).deliveryPartnerName || order.deliveryPartnerId.slice(0, 8)}
                            </p>
                          </div>
                          {order.onTheWayAt && (
                            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>
                                {Math.round((Date.now() - new Date(order.onTheWayAt).getTime()) / 60000)} min
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}






