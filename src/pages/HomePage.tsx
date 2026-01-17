import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ShopCard } from '@/components/shop/ShopCard';
import { shops } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { user, getCartItemCount, getCartTotal } = useApp();
  const { t, language } = useLanguage();
  const cartCount = getCartItemCount();
  const cartTotal = getCartTotal();

  const greeting = () => {
    const hour = new Date().getHours();
    if (language === 'te') {
      if (hour < 12) return 'శుభోదయం';
      if (hour < 17) return 'శుభ మధ్యాహ్నం';
      return 'శుభ సాయంత్రం';
    } else {
      if (hour < 12) return 'Good Morning';
      if (hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()} 👋
          </h1>
          {user?.name && (
            <p className="text-lg text-foreground mt-0.5">{user.name}</p>
          )}
          <p className="text-muted-foreground mt-1">
            {t.nearbyShops}
          </p>
        </div>
      </header>

      {/* Shop List */}
      <div className="px-4 pb-4 space-y-3 stagger-children">
        {shops.map(shop => (
          <ShopCard
            key={shop.id}
            shop={shop}
            onClick={() => navigate(`/shop/${shop.id}`)}
          />
        ))}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto animate-slide-up">
          <button
            onClick={() => navigate('/cart')}
            className="w-full btn-accent flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-foreground/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span>{cartCount} {t.items}</span>
            </div>
            <span className="font-bold">₹{cartTotal}</span>
          </button>
        </div>
      )}
    </MobileLayout>
  );
}
