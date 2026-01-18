import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ShopCard } from '@/components/shop/ShopCard';
import { SkeletonShopCard } from '@/components/ui/SkeletonCard';
import { shops } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { user, getCartItemCount, getCartTotal } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const cartCount = getCartItemCount();
  const cartTotal = getCartTotal();
  
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for polished UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t.greeting}
            </h1>
            {user?.name && (
              <p className="text-lg text-foreground mt-0.5">{user.name}</p>
            )}
            <p className="text-muted-foreground mt-1">
              {t.nearbyShops}
            </p>
          </div>
          
          {/* Language Toggle */}
          <div className="flex items-center bg-muted rounded-full p-0.5">
            <button
              onClick={() => setLanguage('te')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                language === 'te'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Shop List */}
      <div className="px-4 pb-4 space-y-3">
        {isLoading ? (
          // Skeleton Loading State
          <>
            <SkeletonShopCard />
            <SkeletonShopCard />
            <SkeletonShopCard />
          </>
        ) : (
          // Actual Shop List
          <div className="space-y-3 stagger-children">
            {shops.map(shop => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onClick={() => navigate(`/shop/${shop.id}`)}
              />
            ))}
          </div>
        )}
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
