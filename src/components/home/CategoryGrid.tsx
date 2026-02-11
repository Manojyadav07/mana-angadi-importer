import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBasket, Pill, Apple } from 'lucide-react';

interface CategoryItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export function CategoryGrid() {
  const navigate = useNavigate();

  const categories: CategoryItem[] = [
    {
      icon: <UtensilsCrossed className="w-6 h-6" strokeWidth={1.3} />,
      label: 'Food',
      path: '/home',
    },
    {
      icon: <ShoppingBasket className="w-6 h-6" strokeWidth={1.3} />,
      label: 'Grocery',
      path: '/home',
    },
    {
      icon: <Pill className="w-6 h-6" strokeWidth={1.3} />,
      label: 'Pharmacy',
      path: '/home',
    },
    {
      icon: <Apple className="w-6 h-6" strokeWidth={1.3} />,
      label: 'Vegetables & Fruits',
      path: '/home',
    },
  ];

  return (
    <section className="px-5 pt-6 pb-2">
      <div className="grid grid-cols-2 gap-3.5">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => navigate(cat.path)}
            className="bg-card rounded-2xl p-5 flex flex-col items-center gap-3 shadow-[0_1px_4px_0_hsl(var(--foreground)/0.04)] active:scale-[0.98] transition-transform duration-200 touch-manipulation"
          >
            <span className="text-muted-foreground">{cat.icon}</span>
            <span className="text-[14px] font-medium text-foreground leading-tight text-center">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
