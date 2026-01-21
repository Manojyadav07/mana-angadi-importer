import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchantShop } from '@/hooks/useShops';
import { useMerchantOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Package, Clock, RefreshCw, Store } from 'lucide-react';
import { Order, OrderStatus, getShopTypeIcon } from '@/types';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { MerchantOrderDetailSheet } from '@/components/merchant/MerchantOrderDetailSheet';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type FilterType = 'all' | 'placed' | 'accepted' | 'ready' | 'delivered';

export function MerchantOrdersPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Fetch merchant's shop from database
  const { data: shop, isLoading: isLoadingShop, error: shopError } = useMerchantShop(user?.id);
  
  // Fetch orders for the merchant's shop
  const { data: orders = [], isLoading: isLoadingOrders, refetch: refetchOrders } = useMerchantOrders(shop?.id);
  
  const updateOrderStatus = useUpdateOrderStatus();

  // Auto-refresh orders every 15 seconds
  useEffect(() => {
    if (!shop?.id) return;
    
    const interval = setInterval(() => {
      refetchOrders();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [shop?.id, refetchOrders]);

  const isLoading = isLoadingShop || isLoadingOrders;

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

  const handleAccept = async (orderId: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: 'accepted' });
      toast.success(t.orderAccepted);
      setSelectedOrder(null);
      refetchOrders();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to accept order' : 'ఆర్డర్ అంగీకరించడం విఫలమైంది');
    }
  };

  const handleReject = async (orderId: string, reason_te: string, reason_en: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: 'rejected' });
      toast.error(t.orderRejected);
      setSelectedOrder(null);
      refetchOrders();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to reject order' : 'ఆర్డర్ తిరస్కరించడం విఫలమైంది');
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: 'ready' });
      toast.success(t.orderMarkedReady);
      setSelectedOrder(null);
      refetchOrders();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to mark order ready' : 'ఆర్డర్ రెడీగా మార్చడం విఫలమైంది');
    }
  };

  const handleRefresh = () => {
    refetchOrders();
    toast.success(language === 'en' ? 'Refreshing orders...' : 'ఆర్డర్లు రిఫ్రెష్ అవుతున్నాయి...');
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

  // Show "No shop assigned" state if merchant has no shop
  if (!isLoadingShop && !shop) {
    return (
      <MobileLayout>
        <header className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-foreground animate-fade-in">
            {t.incomingOrders}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm animate-fade-in" style={{ animationDelay: '0.05s' }}>
            {t.merchantMode}
          </p>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Store className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center text-lg mb-2">
            {language === 'en' ? 'No shop assigned yet' : 'ఇంకా దుకాణం కేటాయించబడలేదు'}
          </p>
          <p className="text-sm text-muted-foreground text-center">
            {language === 'en' ? 'Contact admin to get your shop assigned.' : 'మీ దుకాణాన్ని కేటాయించడానికి అడ్మిన్‌ను సంప్రదించండి.'}
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground animate-fade-in">
            {t.incomingOrders}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm animate-fade-in" style={{ animationDelay: '0.05s' }}>
            {shop ? (language === 'en' ? shop.name_en : shop.name_te) : t.merchantMode}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
        </button>
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
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
          >
            {language === 'en' ? 'Refresh' : 'రిఫ్రెష్'}
          </button>
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
