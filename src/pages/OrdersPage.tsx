import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { OrderCard } from '@/components/order/OrderCard';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Package } from 'lucide-react';

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders } = useApp();
  const { t } = useLanguage();

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground animate-fade-in">
          {t.myOrders}
        </h1>
        <p className="text-muted-foreground mt-1 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          {t.name === 'Name' ? 'View your order status here' : 'మీ ఆర్డర్ స్థితి ఇక్కడ చూడండి'}
        </p>
      </header>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center text-lg">
            {t.noOrders}
          </p>
          <button
            onClick={() => navigate('/home')}
            className="btn-primary mt-6"
          >
            {t.name === 'Name' ? 'Browse Shops' : 'అంగడులు చూడండి'}
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-3 stagger-children">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/order/${order.id}`)}
            />
          ))}
        </div>
      )}
    </MobileLayout>
  );
}
