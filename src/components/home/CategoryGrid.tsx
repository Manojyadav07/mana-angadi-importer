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
    { icon: <UtensilsCrossed className="w-5 h-5" strokeWidth={1.2} />, label: 'Food', path: '/home' },
    { icon: <ShoppingBasket className="w-5 h-5" strokeWidth={1.2} />, label: 'Grocery', path: '/home' },
    { icon: <Pill className="w-5 h-5" strokeWidth={1.2} />, label: 'Pharmacy', path: '/home' },
    { icon: <Apple className="w-5 h-5" strokeWidth={1.2} />, label: 'Vegetables & Fruits', path: '/home' },
  ];

  return (
    <section className="px-5 pt-4 pb-2">
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => navigate(cat.path)}
            className="bg-card rounded-2xl p-5 flex flex-col items-center gap-3 border border-border/60 active:scale-[0.98] transition-transform duration-200 touch-manipulation"
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
