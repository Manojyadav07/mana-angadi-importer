import { useState, useEffect, useCallback } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useDeliveryOrders, useUpdateOrderStatus, useAcceptDelivery } from '@/hooks/useOrders';
import { useUpdateDeliveryLocation } from '@/hooks/useDeliveryLocation';
import { Order, getShopTypeIcon } from '@/types';
import { Package, MapPin, Truck, Phone, ArrowRight, CheckCircle, Navigation, RefreshCw, Loader2 } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { DeliveryStatusStepper } from '@/components/delivery/DeliveryStatusStepper';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import { HelpSupportButton } from '@/components/order/HelpSupportButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';

export function DeliveryOrdersPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  // Database hooks
  const { data: deliveryData, isLoading, refetch } = useDeliveryOrders(user?.id);
  const updateOrderStatus = useUpdateOrderStatus();
  const acceptDelivery = useAcceptDelivery();
  const updateLocation = useUpdateDeliveryLocation();

  const readyOrders = deliveryData?.available || [];
  const assignedOrders = deliveryData?.assigned || [];
  const activeOrder = assignedOrders.find(o => ['assigned', 'pickedUp', 'onTheWay'].includes(o.status));

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Location tracking for active delivery
  const sendLocationUpdate = useCallback(() => {
    if (!activeOrder || !user?.id || !['assigned', 'pickedUp', 'onTheWay'].includes(activeOrder.status)) return;
    
    if (!navigator.geolocation) {
      // Use mock location for demo
      const mockLat = 18.81 + (Math.random() * 0.02);
      const mockLng = 78.59 + (Math.random() * 0.02);
      updateLocation.mutate({
        orderId: activeOrder.id,
        deliveryPersonId: user.id,
        lat: mockLat,
        lng: mockLng,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation.mutate({
          orderId: activeOrder.id,
          deliveryPersonId: user.id,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.log('Location error:', error.message);
        // Use mock location for testing
        const progress = Math.random();
        const mockLat = 18.8305 - (progress * 0.0413);
        const mockLng = 78.6098 - (progress * 0.0375);
        updateLocation.mutate({
          orderId: activeOrder.id,
          deliveryPersonId: user.id,
          lat: mockLat,
          lng: mockLng,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, [activeOrder, user?.id, updateLocation]);

  // Request location permission and start tracking
  useEffect(() => {
    if (!activeOrder || !['assigned', 'pickedUp', 'onTheWay'].includes(activeOrder.status)) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission('granted');
          toast.success(language === 'te' ? 'లొకేషన్ ట్రాకింగ్ ఆన్' : 'Location tracking on');
        },
        () => setLocationPermission('denied')
      );
    }

    sendLocationUpdate();
    const interval = setInterval(sendLocationUpdate, 15000);
    return () => clearInterval(interval);
  }, [activeOrder?.id, activeOrder?.status, sendLocationUpdate, language]);

  const handleAcceptDelivery = (order: Order) => {
    if (user) {
      acceptDelivery.mutate(
        { orderId: order.id, deliveryPersonId: user.id },
        {
          onSuccess: () => {
            toast.success(language === 'te' ? 'డెలివరీ అంగీకరించారు!' : 'Delivery accepted!');
            refetch();
          },
          onError: () => {
            toast.error(language === 'te' ? 'అంగీకరించడంలో విఫలమైంది' : 'Failed to accept');
          }
        }
      );
    }
  };

  const handleStatusUpdate = (status: 'pickedUp' | 'onTheWay' | 'delivered') => {
    if (activeOrder) {
      updateOrderStatus.mutate(
        { orderId: activeOrder.id, status },
        {
          onSuccess: () => {
            const messages = {
              pickedUp: language === 'te' ? 'పికప్ చేసారు!' : 'Picked up!',
              onTheWay: language === 'te' ? 'డెలివరీ ప్రారంభమైంది!' : 'Delivery started!',
              delivered: language === 'te' ? 'డెలివరీ పూర్తయింది!' : 'Delivered successfully!',
            };
            toast.success(messages[status]);
            if (status === 'delivered') {
              setSelectedOrder(null);
            }
            refetch();
          },
          onError: () => {
            toast.error(language === 'te' ? 'అప్‌డేట్ విఫలమైంది' : 'Update failed');
          }
        }
      );
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

  const getAddressText = (order: Order) => {
    return language === 'en' 
      ? order.customerAddressText_en || 'Near Temple, Metlachittapur'
      : order.customerAddressText_te || 'గుడి దగ్గర, మెట్లచిట్టాపూర్';
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
          <button 
            onClick={() => refetch()} 
            className="p-2 rounded-full hover:bg-muted transition-colors"
            title={language === 'en' ? 'Refresh' : 'రిఫ్రెష్'}
          >
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
          </button>
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
                  <span>{getAddressText(activeOrder)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">₹{activeOrder.total}</span>
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Location Tracking Indicator */}
              {['assigned', 'pickedUp', 'onTheWay'].includes(activeOrder.status) && (
                <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <Navigation className="w-3 h-3" />
                  {language === 'te' ? 'లొకేషన్ షేర్ అవుతోంది' : 'Sharing location'}
                </div>
              )}

              {/* Action Button */}
              {getNextAction() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    getNextAction()?.action();
                  }}
                  disabled={updateOrderStatus.isPending}
                  className={`w-full mt-4 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${getNextAction()?.color} active:scale-98 transition-transform disabled:opacity-70`}
                >
                  {updateOrderStatus.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
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
              {readyOrders.map(order => (
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
                    <span>{getAddressText(order)}</span>
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
                      disabled={!!activeOrder || acceptDelivery.isPending}
                      className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
                    >
                      {acceptDelivery.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t.acceptDelivery
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-left">
                {t.orderId} #{selectedOrder?.id.slice(0, 8)}
              </SheetTitle>
              {selectedOrder && <HelpSupportButton orderId={selectedOrder.id} />}
            </div>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="mt-4 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Timeline */}
              <div className="bg-muted/50 rounded-xl p-4">
                <OrderTimeline order={selectedOrder} compact />
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
                  {getAddressText(selectedOrder)}
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
                  disabled={updateOrderStatus.isPending}
                  className={`w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${getNextAction()?.color} active:scale-98 transition-transform disabled:opacity-70`}
                >
                  {updateOrderStatus.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
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
