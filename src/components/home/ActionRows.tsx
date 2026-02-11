import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBasket, Pill, Apple, Wrench, Key } from 'lucide-react';

interface CategoryItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export function ActionRows() {
  const navigate = useNavigate();

  const categories: CategoryItem[] = [
    { icon: <UtensilsCrossed className="w-6 h-6" strokeWidth={1.4} />, label: 'Food', path: '/home' },
    { icon: <ShoppingBasket className="w-6 h-6" strokeWidth={1.4} />, label: 'Grocery', path: '/home' },
    { icon: <Pill className="w-6 h-6" strokeWidth={1.4} />, label: 'Pharmacy', path: '/home' },
    { icon: <Apple className="w-6 h-6" strokeWidth={1.4} />, label: 'Vegetables & Fruits', path: '/home' },
    { icon: <Wrench className="w-6 h-6" strokeWidth={1.4} />, label: 'Services', path: '/home' },
    { icon: <Key className="w-6 h-6" strokeWidth={1.4} />, label: 'Rentals', path: '/home' },
  ];

  return (
    <section className="px-5 pt-7 pb-2">
      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => navigate(cat.path)}
            className="flex flex-col items-center gap-2.5 py-5 px-2 rounded-2xl bg-card shadow-[0_1px_3px_0_hsl(var(--foreground)/0.04)] active:scale-[0.98] active:shadow-none transition-all duration-200 touch-manipulation"
          >
            <span className="text-muted-foreground">{cat.icon}</span>
            <span className="text-[12px] font-medium text-foreground leading-tight text-center">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
