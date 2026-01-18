import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getShopsByOwner } from '@/data/mockData';
import { Package, Clock } from 'lucide-react';
import { Order, OrderStatus, getShopTypeIcon } from '@/types';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { MerchantOrderDetailSheet } from '@/components/merchant/MerchantOrderDetailSheet';
import { toast } from 'sonner';

type FilterType = 'all' | 'placed' | 'accepted' | 'ready' | 'delivered';

export function MerchantOrdersPage() {
  const { user, getOrdersByShopIds, updateOrderStatus } = useApp();
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const shops = user?.shopIds ? getShopsByOwner(user.id) : [];
  const shopIds = shops.map(s => s.id);
  const orders = getOrdersByShopIds(shopIds);

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'placed': return t.statusPlaced;
      case 'accepted': return t.statusAccepted;
      case 'ready': return t.statusReady;
      case 'delivered': return t.statusDelivered;
      case 'rejected': return t.statusRejected;
      default: return status;
    }
  };

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

  const filterChips: { key: FilterType; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'placed', label: t.new },
    { key: 'accepted', label: t.statusAccepted },
    { key: 'ready', label: t.statusReady },
  ];

  const handleAccept = (orderId: string) => {
    updateOrderStatus(orderId, 'accepted');
    toast.success(t.orderAccepted);
    setSelectedOrder(null);
  };

  const handleReject = (orderId: string, reason_te: string, reason_en: string) => {
    updateOrderStatus(orderId, 'rejected', reason_te, reason_en);
    toast.error(t.orderRejected);
    setSelectedOrder(null);
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
    toast.success(t.orderMarkedReady);
    setSelectedOrder(null);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return language === 'en' ? 'Just now' : 'ఇప్పుడే';
    if (minutes < 60) return `${minutes} ${language === 'en' ? 'min ago' : 'ని. క్రితం'}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${language === 'en' ? 'hr ago' : 'గం. క్రితం'}`;
    return date.toLocaleDateString();
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground animate-fade-in">
          {t.incomingOrders}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm animate-fade-in" style={{ animationDelay: '0.05s' }}>
          {t.merchantMode}
        </p>
      </header>

      {/* Filter Chips */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {filterChips.map(chip => (
            <button
              key={chip.key}
              onClick={() => setFilter(chip.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === chip.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="px-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center text-lg">
            {t.noOrders}
          </p>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-3 stagger-children">
          {filteredOrders.map(order => {
            const shopName = language === 'en' ? order.shopName_en : order.shopName_te;
            
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-card rounded-2xl border border-border p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getShopTypeIcon(order.shopType)}</span>
                    <div>
                      <p className="font-semibold text-foreground">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">{shopName}</p>
                    </div>
                  </div>
                  <span className={statusClasses[order.status]}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(order.createdAt)}
                  </span>
                  <span className="font-semibold text-foreground">₹{order.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Sheet */}
      <MerchantOrderDetailSheet
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAccept={handleAccept}
        onReject={handleReject}
        onMarkReady={handleMarkReady}
      />
    </MobileLayout>
  );
}
