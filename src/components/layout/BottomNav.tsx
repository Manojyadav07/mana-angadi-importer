import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, ShoppingCart, Truck, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemCount } = useApp();
  const { t } = useLanguage();
  const cartCount = getCartItemCount();

  const hiddenPaths = ['/', '/login', '/order-success', '/delivery/onboarding'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/home' && location.pathname.startsWith('/shop'));

  const tabClass = (active: boolean) =>
    `flex flex-col items-center gap-1 ${active ? 'text-primary' : 'opacity-30'}`;

  const labelClass = 'text-[10px] font-bold uppercase tracking-widest';

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-mana-charcoal/5 px-8 pt-4 pb-8 z-50">
      <div className="flex justify-between items-end">
        {/* Tab 1 – Home */}
        <button onClick={() => navigate('/home')} className={tabClass(isActive('/home'))}>
          <Home className="w-6 h-6" strokeWidth={1.5} />
          <span className={labelClass}>{t.navHome}</span>
        </button>

        {/* Tab 2 – Favourite */}
        <button onClick={() => navigate('/favorites')} className={tabClass(isActive('/favorites'))}>
          <Heart className="w-6 h-6" strokeWidth={1.5} />
          <span className={labelClass}>{t.navSaved}</span>
        </button>

        {/* Center Floating Basket */}
        <div className="relative -top-8">
          <button
            onClick={() => navigate('/cart')}
            className="bg-primary w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 ring-8 ring-mana-cream"
          >
            <ShoppingCart className="w-7 h-7" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-mana-charcoal text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 4 – Orders */}
        <button onClick={() => navigate('/orders')} className={tabClass(isActive('/orders'))}>
          <Truck className="w-6 h-6" strokeWidth={1.5} />
          <span className={labelClass}>{t.navOrders}</span>
        </button>

        {/* Tab 5 – Profile */}
        <button onClick={() => navigate('/profile')} className={tabClass(isActive('/profile'))}>
          <User className="w-6 h-6" strokeWidth={1.5} />
          <span className={labelClass}>{t.navProfile}</span>
        </button>
      </div>

      {/* iOS bottom safe area spacer */}
      <div className="h-4" />
    </nav>
  );
}
