import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Bike, Store, Banknote } from 'lucide-react';

const tabs = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/admin/dashboard'   },
  { label: 'Orders',      icon: ShoppingBag,     path: '/admin/orders'      },
  { label: 'Partners',    icon: Bike,            path: '/admin/delivery-partners' },
  { label: 'Merchants',   icon: Store,           path: '/admin/merchants'   },
  { label: 'Settlements', icon: Banknote,        path: '/admin/settlements' },
];

export function AdminBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex justify-around items-center h-16 max-w-md mx-auto">
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}