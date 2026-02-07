import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, User, ShoppingBag, Wallet, Truck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUserMode } from '@/context/UserModeContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemCount } = useApp();
  const { userMode } = useUserMode();
  const { t } = useLanguage();
  const cartCount = getCartItemCount();

  const customerNavItems = [
    { path: '/home', icon: <Home className="w-6 h-6" />, label: t.navHome },
    { path: '/orders', icon: <Package className="w-6 h-6" />, label: t.navOrders },
    { path: '/profile', icon: <User className="w-6 h-6" />, label: t.navProfile },
  ];

  const merchantNavItems = [
    { path: '/merchant/orders', icon: <Package className="w-6 h-6" />, label: t.navOrders },
    { path: '/merchant/products', icon: <ShoppingBag className="w-6 h-6" />, label: t.navProducts },
    { path: '/merchant/profile', icon: <User className="w-6 h-6" />, label: t.navProfile },
  ];

  const deliveryNavItems = [
    { path: '/delivery/orders', icon: <Truck className="w-6 h-6" />, label: t.navDeliveries },
    { path: '/delivery/earnings', icon: <Wallet className="w-6 h-6" />, label: t.navEarnings },
    { path: '/delivery/profile', icon: <User className="w-6 h-6" />, label: t.navProfile },
  ];

  const navItems = userMode === 'delivery' ? deliveryNavItems : userMode === 'merchant' ? merchantNavItems : customerNavItems;

  const hiddenPaths = ['/', '/login', '/cart', '/order-success', '/delivery/onboarding'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <div className="max-w-md mx-auto w-full flex items-center justify-around">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || 
            (item.path === '/home' && location.pathname.startsWith('/shop')) ||
            (item.path === '/merchant/orders' && location.pathname.startsWith('/merchant/order/'));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={isActive ? 'bottom-nav-item-active' : 'bottom-nav-item'}
            >
              <div className="relative">
                {item.icon}
                {userMode === 'customer' && item.path === '/home' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-2xs rounded-full flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
