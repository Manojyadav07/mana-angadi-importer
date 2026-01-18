import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getShopTypeIcon } from '@/types';
import { Wallet, TrendingUp, Package, Clock } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

export function DeliveryEarningsPage() {
  const { user, getDeliveryPartnerOrders } = useApp();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const myOrders = user ? getDeliveryPartnerOrders(user.id) : [];
  const deliveredOrders = myOrders.filter(o => o.status === 'delivered');
  
  // Filter today's deliveries
  const today = new Date().toDateString();
  const todayDeliveries = deliveredOrders.filter(o => 
    o.deliveredAt && new Date(o.deliveredAt).toDateString() === today
  );

  const todayEarnings = todayDeliveries.reduce((sum, o) => sum + (o.deliveryFee || 20), 0);
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 20), 0);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(language === 'te' ? 'te-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <header className="screen-header">
          <h1 className="text-xl font-bold text-foreground">{t.earnings}</h1>
        </header>
        <div className="px-4 py-4 space-y-4">
          <SkeletonCard variant="shop" />
          <SkeletonCard variant="order" />
          <SkeletonCard variant="order" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="screen-header">
        <h1 className="text-xl font-bold text-foreground">{t.earnings}</h1>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Today's Earnings */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t.todayEarnings}</p>
            <p className="text-2xl font-bold text-primary">₹{todayEarnings}</p>
          </div>

          {/* Today's Deliveries */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t.todayDeliveries}</p>
            <p className="text-2xl font-bold text-green-600">{todayDeliveries.length}</p>
          </div>
        </div>

        {/* Total Stats */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t.total} {t.earnings}</p>
              <p className="text-xl font-bold text-foreground">₹{totalEarnings}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t.total} {t.navDeliveries}</p>
              <p className="text-xl font-bold text-foreground">{deliveredOrders.length}</p>
            </div>
          </div>
        </div>

        {/* Delivery History */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            {t.todayDeliveries}
          </h2>

          {todayDeliveries.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t.noEarningsYet}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayDeliveries.map(order => (
                <div 
                  key={order.id}
                  className="bg-card rounded-2xl border border-border p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getShopTypeIcon(order.shopType)}</span>
                      <span className="font-medium text-foreground">
                        {language === 'en' ? order.shopName_en : order.shopName_te}
                      </span>
                    </div>
                    <span className="badge-delivered">{t.statusDelivered}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{order.deliveredAt && formatTime(order.deliveredAt)}</span>
                    </div>
                    <span className="font-semibold text-primary">
                      +₹{order.deliveryFee || 20}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
}