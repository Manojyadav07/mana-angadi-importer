import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Order, getShopTypeIcon } from '@/types';
import { getShopById } from '@/data/mockData';
import { Package, MapPin, Truck, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { DeliveryStatusStepper } from '@/components/delivery/DeliveryStatusStepper';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function DeliveryOrdersPage() {
  const { user, orders, getReadyOrders, getDeliveryPartnerOrders, acceptDelivery, updateDeliveryStatus } = useApp();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const readyOrders = getReadyOrders();
  const myOrders = user ? getDeliveryPartnerOrders(user.id) : [];
  const activeOrder = myOrders.find(o => ['assigned', 'pickedUp', 'onTheWay'].includes(o.status));
  const completedToday = myOrders.filter(o => 
    o.status === 'delivered' && 
    o.deliveredAt && 
    new Date(o.deliveredAt).toDateString() === new Date().toDateString()
  );

  const handleAcceptDelivery = (order: Order) => {
    if (user) {
      acceptDelivery(order.id, user.id, user.name || 'Delivery Partner');
    }
  };

  const handleStatusUpdate = (status: 'pickedUp' | 'onTheWay' | 'delivered') => {
    if (activeOrder) {
      updateDeliveryStatus(activeOrder.id, status);
      if (status === 'delivered') {
        setSelectedOrder(null);
      }
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return t.statusReady;
      case 'assigned': return t.statusAssigned;
      case 'pickedUp': return t.statusPickedUp;
      case 'onTheWay': return t.statusOnTheWay;
      case 'delivered': return t.statusDelivered;
      default: return status;
    }
  };

  const getNextAction = () => {
    if (!activeOrder) return null;
    switch (activeOrder.status) {
      case 'assigned':
        return { label: t.markPickedUp, action: () => handleStatusUpdate('pickedUp'), color: 'bg-amber-500' };
      case 'pickedUp':
        return { label: t.startDelivery, action: () => handleStatusUpdate('onTheWay'), color: 'bg-blue-500' };
      case 'onTheWay':
        return { label: t.markDelivered, action: () => handleStatusUpdate('delivered'), color: 'bg-green-500' };
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <header className="screen-header">
          <h1 className="text-xl font-bold text-foreground">{t.navDeliveries}</h1>
        </header>
        <div className="px-4 py-4 space-y-4">
          <SkeletonCard variant="order" />
          <SkeletonCard variant="order" />
          <SkeletonCard variant="order" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="screen-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">{t.navDeliveries}</h1>
          {completedToday.length > 0 && (
            <span className="badge-delivered">
              {completedToday.length} {t.statusDelivered}
            </span>
          )}
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Active Delivery Section */}
        {activeOrder && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              {t.myActiveDelivery}
            </h2>
            
            <div 
              className="bg-card rounded-2xl border-2 border-primary p-4 shadow-md cursor-pointer"
              onClick={() => setSelectedOrder(activeOrder)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getShopTypeIcon(activeOrder.shopType)}</span>
                  <span className="font-semibold text-foreground">
                    {language === 'en' ? activeOrder.shopName_en : activeOrder.shopName_te}
                  </span>
                </div>
                <span className="badge-ready">{getStatusLabel(activeOrder.status)}</span>
              </div>

              <DeliveryStatusStepper status={activeOrder.status} />

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{activeOrder.customerAddressText || 'Near Temple, Metlachittapur'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">₹{activeOrder.total}</span>
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Action Button */}
              {getNextAction() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    getNextAction()?.action();
                  }}
                  className={`w-full mt-4 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${getNextAction()?.color} active:scale-98 transition-transform`}
                >
                  <CheckCircle className="w-5 h-5" />
                  {getNextAction()?.label}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Available Deliveries Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            {t.availableDeliveries}
          </h2>

          {readyOrders.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t.noDeliveriesAvailable}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {readyOrders.map(order => {
                const shop = getShopById(order.shopId);
                return (
                  <div 
                    key={order.id}
                    className="bg-card rounded-2xl border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getShopTypeIcon(order.shopType)}</span>
                        <span className="font-semibold text-foreground">
                          {language === 'en' ? order.shopName_en : order.shopName_te}
                        </span>
                      </div>
                      <span className="badge-ready">{t.statusReady}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{order.customerAddressText || 'Near Temple, Metlachittapur'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-foreground font-medium">₹{order.total}</span>
                        {order.deliveryFee && (
                          <span className="text-sm text-primary ml-2">+₹{order.deliveryFee} {t.deliveryFee}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAcceptDelivery(order)}
                        disabled={!!activeOrder}
                        className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
                      >
                        {t.acceptDelivery}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-left">
              {t.orderId} #{selectedOrder?.id}
            </SheetTitle>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="mt-4 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Status */}
              <div className="bg-muted/50 rounded-xl p-4">
                <DeliveryStatusStepper status={selectedOrder.status} />
              </div>

              {/* Pickup Location */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {t.pickup}
                </h4>
                <p className="text-foreground">
                  {language === 'en' ? selectedOrder.shopName_en : selectedOrder.shopName_te}
                </p>
                <button className="flex items-center gap-2 text-primary mt-2 text-sm">
                  <Phone className="w-4 h-4" />
                  {t.callShop}
                </button>
              </div>

              {/* Drop Location */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t.dropoff}
                </h4>
                <p className="text-foreground">
                  {selectedOrder.customerAddressText || 'Near Temple, Metlachittapur'}
                </p>
                <button className="flex items-center gap-2 text-primary mt-2 text-sm">
                  <Phone className="w-4 h-4" />
                  {t.callCustomer}
                </button>
              </div>

              {/* Order Items */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h4 className="font-semibold text-foreground mb-3">{t.orderDetails}</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {language === 'en' ? item.productName_en : item.productName_te} × {item.quantity}
                      </span>
                      <span className="text-foreground">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                    <span>{t.total}</span>
                    <span className="text-primary">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {getNextAction() && (
                <button
                  onClick={() => getNextAction()?.action()}
                  className={`w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${getNextAction()?.color} active:scale-98 transition-transform`}
                >
                  <CheckCircle className="w-5 h-5" />
                  {getNextAction()?.label}
                </button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}