import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { LayoutDashboard, Users, Store, DollarSign, Package, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

export function AdminBottomNav() {
  const { language } = useLanguage();
  const location = useLocation();

  const navItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label_te: 'డాష్‌బోర్డ్',
      label_en: 'Dashboard',
    },
    {
      path: '/admin/onboarding',
      icon: Users,
      label_te: 'ఆన్‌బోర్డింగ్',
      label_en: 'Onboarding',
    },
    {
      path: '/admin/shops',
      icon: Store,
      label_te: 'షాప్స్',
      label_en: 'Shops',
    },
    {
      path: '/admin/fees',
      icon: DollarSign,
      label_te: 'ఫీస్',
      label_en: 'Fees',
    },
    {
      path: '/admin/orders',
      icon: Package,
      label_te: 'ఆర్డర్లు',
      label_en: 'Orders',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const label = language === 'en' ? item.label_en : item.label_te;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
