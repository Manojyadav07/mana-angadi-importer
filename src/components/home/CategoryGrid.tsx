import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBasket, Pill, Apple } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryItem {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  path: string;
}

export function CategoryGrid() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const categories: CategoryItem[] = [
    {
      icon: <UtensilsCrossed className="w-9 h-9" />,
      label: language === 'en' ? 'Food' : 'ఆహారం',
      sublabel: language === 'en' ? 'Meals & snacks nearby' : 'భోజనం & చిరుతిళ్ళు',
      path: '/home',
    },
    {
      icon: <ShoppingBasket className="w-9 h-9" />,
      label: language === 'en' ? 'Grocery' : 'కిరాణా',
      sublabel: language === 'en' ? 'Daily essentials' : 'రోజువారీ అవసరాలు',
      path: '/home',
    },
    {
      icon: <Pill className="w-9 h-9" />,
      label: language === 'en' ? 'Pharmacy' : 'మందులు',
      sublabel: language === 'en' ? 'Medicines & care' : 'మందులు & సంరక్షణ',
      path: '/home',
    },
    {
      icon: <Apple className="w-9 h-9" />,
      label: language === 'en' ? 'Vegetables & Fruits' : 'కూరగాయలు & పండ్లు',
      sublabel: language === 'en' ? 'Local produce' : 'స్థానిక ఉత్పత్తులు',
      path: '/home',
    },
  ];

  return (
    <section className="px-4 mt-6">
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => navigate(cat.path)}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm active:scale-[0.98] active:opacity-90 transition-all duration-200 touch-manipulation"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              {cat.icon}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground leading-tight">{cat.label}</p>
              <p className="text-2xs text-muted-foreground mt-1 leading-snug">{cat.sublabel}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
