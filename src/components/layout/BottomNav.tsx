import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, Package, User } from 'lucide-react';
import { GampaIcon } from '@/components/home/GampaIcon';
import { useApp } from '@/context/AppContext';
import { useUserMode } from '@/context/UserModeContext';
import { useLanguage } from '@/context/LanguageContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemCount } = useApp();
  const { userMode } = useUserMode();
  const { t } = useLanguage();
  const cartCount = getCartItemCount();

  const customerNavItems = [
    { path: '/home', icon: <Home className="w-6 h-6" />, label: t.navHome },
    { path: '/favorites', icon: <Heart className="w-6 h-6" />, label: null },
    { path: '/cart', icon: <GampaIcon className="w-6 h-6" />, label: null, badge: cartCount },
    { path: '/orders', icon: <Package className="w-6 h-6" />, label: t.navOrders },
    { path: '/profile', icon: <User className="w-6 h-6" />, label: t.navProfile },
  ];

  const merchantNavItems = [
    { path: '/merchant/orders', icon: <Package className="w-6 h-6" />, label: t.navOrders },
    { path: '/merchant/products', icon: <Home className="w-6 h-6" />, label: t.navProducts },
    { path: '/merchant/profile', icon: <User className="w-6 h-6" />, label: t.navProfile },
  ];

  const deliveryNavItems = [
    { path: '/delivery/orders', icon: <Package className="w-6 h-6" />, label: t.navDeliveries },
    { path: '/delivery/earnings', icon: <Home className="w-6 h-6" />, label: t.navEarnings },
    { path: '/delivery/profile', icon: <User className="w-6 h-6" />, label: t.navProfile },
  ];

  const navItems =
    userMode === 'delivery'
      ? deliveryNavItems
      : userMode === 'merchant'
        ? merchantNavItems
        : customerNavItems;

  const hiddenPaths = ['/', '/login', '/order-success', '/delivery/onboarding'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="bottom-nav">
      <div className="max-w-md mx-auto w-full flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/home' && location.pathname.startsWith('/shop'));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={isActive ? 'bottom-nav-item-active' : 'bottom-nav-item'}
            >
              <div className="relative">
                {item.icon}
                {'badge' in item && (item as any).badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-2xs rounded-full flex items-center justify-center font-bold">
                    {(item as any).badge > 9 ? '9+' : (item as any).badge}
                  </span>
                )}
              </div>
              {item.label && <span className="text-xs mt-1 font-medium">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
