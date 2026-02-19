import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, Truck, Menu } from 'lucide-react';
import { GampaIcon } from '@/components/home/GampaIcon';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/context/LanguageContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemCount } = useCart();
  const { t } = useLanguage();
  const cartCount = getCartItemCount();

  const hiddenPaths = ['/', '/login', '/order-success', '/delivery/onboarding'];
  if (hiddenPaths.some((p) => location.pathname === p)) return null;

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/home' && location.pathname.startsWith('/shop'));

  const tabClass = (active: boolean) =>
    `flex flex-col items-center gap-1 ${active ? 'text-primary' : 'opacity-30'}`;

  const labelClass = 'text-[9px] uppercase tracking-widest font-bold';

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-mana-charcoal/5 px-8 pt-3 pb-6 z-50">
      <div className="flex justify-between items-end">
        {/* Home */}
        <button onClick={() => navigate('/home')} className={tabClass(isActive('/home'))}>
          <Home className="w-6 h-6" strokeWidth={1.5} />
          <span className={labelClass}>{t.navHome}</span>
        </button>

        {/* Favourite */}
        <button onClick={() => navigate('/favorites')} className={tabClass(isActive('/favorites'))}>
          <Heart className="w-6 h-6" strokeWidth={1.5} />
          <span className={labelClass}>{t.navSaved}</span>
        </button>

        {/* Center Floating Basket */}
        <div className="relative -top-6">
          <button
            onClick={() => navigate('/basket')}
            className={`bg-primary w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-6 ring-mana-cream transition-opacity ${
              cartCount === 0 ? 'opacity-60' : ''
            }`}
          >
            <GampaIcon className="w-11 h-11" strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-mana-cream">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Orders */}
        <button onClick={() => navigate('/orders')} className={tabClass(isActive('/orders'))}>
          <Truck className="w-6 h-6" strokeWidth={1.5} />
          <span className={labelClass}>{t.navOrders}</span>
        </button>

        {/* Menu */}
        <button onClick={() => navigate('/profile')} className={tabClass(isActive('/profile'))}>
          <Menu className="w-6 h-6" strokeWidth={1.5} />
          <span className={labelClass}>{t.navMenu}</span>
        </button>
      </div>

      {/* Bottom spacer */}
      <div className="h-2" />
    </nav>
  );
}
