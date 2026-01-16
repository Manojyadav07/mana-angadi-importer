import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  labelTelugu: string;
}

const navItems: NavItem[] = [
  {
    path: '/home',
    icon: <Home className="w-6 h-6" />,
    label: 'Home',
    labelTelugu: 'అంగడులు',
  },
  {
    path: '/orders',
    icon: <Package className="w-6 h-6" />,
    label: 'Orders',
    labelTelugu: 'ఆర్డర్లు',
  },
  {
    path: '/profile',
    icon: <User className="w-6 h-6" />,
    label: 'Profile',
    labelTelugu: 'నా వివరాలు',
  },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemCount } = useApp();
  const cartCount = getCartItemCount();

  // Don't show nav on login or cart screens
  if (location.pathname === '/' || location.pathname === '/cart' || location.pathname === '/order-success') {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <div className="max-w-md mx-auto w-full flex items-center justify-around">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || 
            (item.path === '/home' && location.pathname.startsWith('/shop'));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={isActive ? 'bottom-nav-item-active' : 'bottom-nav-item'}
            >
              <div className="relative">
                {item.icon}
                {item.path === '/home' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-2xs rounded-full flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.labelTelugu}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
