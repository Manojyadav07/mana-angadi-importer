import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBasket, Pill, Apple, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export function ActionRows() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const items: ActionItem[] = [
    {
      icon: <UtensilsCrossed className="w-4 h-4 opacity-40" strokeWidth={1.2} />,
      label: language === 'en' ? 'Food' : 'ఆహారం',
      path: '/home',
    },
    {
      icon: <ShoppingBasket className="w-4 h-4 opacity-40" strokeWidth={1.2} />,
      label: language === 'en' ? 'Grocery' : 'కిరాణా',
      path: '/home',
    },
    {
      icon: <Pill className="w-4 h-4 opacity-40" strokeWidth={1.2} />,
      label: language === 'en' ? 'Pharmacy' : 'మందులు',
      path: '/home',
    },
    {
      icon: <Apple className="w-4 h-4 opacity-40" strokeWidth={1.2} />,
      label: language === 'en' ? 'Vegetables & Fruits' : 'కూరగాయలు & పండ్లు',
      path: '/home',
    },
  ];

  return (
    <section className="px-5 pt-4 pb-2">
      <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">
        {language === 'en' ? 'Choose what you need' : 'మీకు కావలసింది ఎంచుకోండి'}
      </p>
      <div className="border-t border-border">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3.5 py-4 border-b border-border/70 active:bg-muted/30 transition-colors touch-manipulation"
          >
            <span className="text-muted-foreground">{item.icon}</span>
            <span className="text-sm font-medium text-foreground flex-1 text-left">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </section>
  );
}
