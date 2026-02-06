import { useLanguage } from '@/context/LanguageContext';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useShops } from '@/hooks/useShops';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { Package, Store, Users, Truck, TrendingUp, Clock, Loader2 } from 'lucide-react';

export function AdminDashboardPage() {
  const { language } = useLanguage();
  const { data: orders = [], isLoading } = useAdminOrders();
  const { data: shops = [] } = useShops();

  const labels = {
    title: language === 'en' ? 'Admin Dashboard' : 'అడ్మిన్ డాష్‌బోర్డ్',
    welcome: language === 'en' ? 'Welcome, Admin' : 'స్వాగతం, అడ్మిన్',
    todayOrders: language === 'en' ? "Today's Orders" : 'ఈ రోజు ఆర్డర్లు',
    activeShops: language === 'en' ? 'Active Shops' : 'యాక్టివ్ షాప్స్',
    pendingOnboarding: language === 'en' ? 'Pending Onboarding' : 'పెండింగ్ ఆన్‌బోర్డింగ్',
    inDelivery: language === 'en' ? 'In Delivery' : 'డెలివరీలో',
    quickStats: language === 'en' ? 'Quick Stats' : 'త్వరిత గణాంకాలు',
    recentOrders: language === 'en' ? 'Recent Orders' : 'ఇటీవలి ఆర్డర్లు',
    ordersByStatus: language === 'en' ? 'Orders by Status' : 'స్థితి ప్రకారం ఆర్డర్లు',
    placed: language === 'en' ? 'Placed' : 'నమోదు',
    accepted: language === 'en' ? 'Accepted' : 'అంగీకరించిన',
    ready: language === 'en' ? 'Ready' : 'సిద్ధం',
    assigned: language === 'en' ? 'Assigned' : 'అప్పగించిన',
    onTheWay: language === 'en' ? 'On The Way' : 'వస్తోంది',
    delivered: language === 'en' ? 'Delivered' : 'డెలివరీ అయింది',
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const activeShops = shops.filter(s => s.isActive && s.isOpen);
  const inDeliveryOrders = orders.filter(o => ['assigned', 'pickedUp', 'onTheWay'].includes(o.status));

  const statusCounts = {
    placed: orders.filter(o => o.status === 'placed').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    ready: orders.filter(o => o.status === 'ready').length,
    assigned: orders.filter(o => o.status === 'assigned').length,
    onTheWay: orders.filter(o => o.status === 'onTheWay').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const statCards = [
    { icon: Package, label: labels.todayOrders, value: todayOrders.length, color: 'bg-blue-500/10 text-blue-600' },
    { icon: Store, label: labels.activeShops, value: activeShops.length, color: 'bg-green-500/10 text-green-600' },
    { icon: Users, label: labels.pendingOnboarding, value: 0, color: 'bg-orange-500/10 text-orange-600' },
    { icon: Truck, label: labels.inDelivery, value: inDeliveryOrders.length, color: 'bg-purple-500/10 text-purple-600' },
  ];

  const statusItems = [
    { label: labels.placed, count: statusCounts.placed, color: 'bg-gray-500' },
    { label: labels.accepted, count: statusCounts.accepted, color: 'bg-blue-500' },
    { label: labels.ready, count: statusCounts.ready, color: 'bg-yellow-500' },
    { label: labels.assigned, count: statusCounts.assigned, color: 'bg-orange-500' },
    { label: labels.onTheWay, count: statusCounts.onTheWay, color: 'bg-purple-500' },
    { label: labels.delivered, count: statusCounts.delivered, color: 'bg-green-500' },
  ];

  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <AdminBottomNav />
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      <header className="screen-header">
        <div>
          <h1 className="font-bold text-xl text-foreground">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.welcome}</p>
        </div>
      </header>

      <div className="px-4 space-y-6">
        <section>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {labels.quickStats}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {labels.ordersByStatus}
          </h2>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="space-y-3">
              {statusItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {labels.recentOrders}
          </h2>
          <div className="space-y-2">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-border p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? order.shopName_en : order.shopName_te}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">₹{order.total}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-500/10 text-green-600' :
                    order.status === 'onTheWay' ? 'bg-purple-500/10 text-purple-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AdminBottomNav />
    </div>
  );
}
