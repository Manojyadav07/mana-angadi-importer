import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ShopCard } from '@/components/shop/ShopCard';
import { SkeletonShopCard } from '@/components/ui/SkeletonCard';
import { useShops } from '@/hooks/useShops';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { getCartItemCount, getCartTotal } = useApp();
  const { profile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const cartCount = getCartItemCount();
  const cartTotal = getCartTotal();
  
  // Fetch shops from database
  const { data: shops = [], isLoading, error, refetch } = useShops();

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t.greeting}
            </h1>
            {profile?.display_name && (
              <p className="text-lg text-foreground mt-0.5">{profile.display_name}</p>
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
        ) : error ? (
          // Error State
          <div className="bg-destructive/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-10 h-10 text-destructive mb-3" />
            <p className="text-foreground font-medium mb-2">
              {language === 'en' ? 'Failed to load shops' : 'అంగడులు లోడ్ కాలేదు'}
            </p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              {language === 'en' ? 'Retry' : 'మళ్ళీ ప్రయత్నించండి'}
            </button>
          </div>
        ) : shops.length === 0 ? (
          // Empty State
          <div className="bg-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {language === 'en' ? 'No shops available yet' : 'ఇంకా అంగడులు లేవు'}
            </p>
          </div>
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
