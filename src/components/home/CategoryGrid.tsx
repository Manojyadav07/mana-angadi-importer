import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface CategorySurface {
  label: string;
  subtitle?: string;
  path: string;
  anchor?: boolean;
}

export function CategoryGrid() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const groceries: CategorySurface = {
    label: language === 'en' ? 'Groceries' : 'కిరాణా',
    subtitle: language === 'en' ? 'Daily essentials delivered' : 'రోజువారీ అవసరాలు డెలివరీ',
    path: '/categories',
    anchor: true,
  };

  const paired: CategorySurface[] = [
    { label: language === 'en' ? 'Food' : 'ఆహారం', path: '/categories' },
    { label: language === 'en' ? 'Pharmacy' : 'మందులు', path: '/categories' },
  ];

  const wide: CategorySurface = {
    label: language === 'en' ? 'Vegetables & Fruits' : 'కూరగాయలు & పండ్లు',
    subtitle: language === 'en' ? 'Farm fresh, locally sourced' : 'పొలం నుండి నేరుగా, స్థానికంగా',
    path: '/categories',
  };

  return (
    <section className="px-5 pt-2 pb-2">
      <div className="flex flex-col gap-3">
        {/* Anchor — Groceries */}
        <button
          onClick={() => navigate(groceries.path)}
          className="relative w-full rounded-2xl text-left overflow-hidden active:scale-[0.98] transition-transform duration-200 touch-manipulation"
          style={{ minHeight: 140 }}
        >
          <div
            className="absolute inset-0 bg-muted"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10 p-7 flex flex-col justify-end h-full">
            <h2
              className="text-[22px] font-semibold tracking-tight text-foreground leading-tight"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              {groceries.label}
            </h2>
            {groceries.subtitle && (
              <p className="text-[13px] text-muted-foreground mt-1.5 font-normal">
                {groceries.subtitle}
              </p>
            )}
          </div>
        </button>

        {/* Paired — Food | Pharmacy */}
        <div className="grid grid-cols-2 gap-3">
          {paired.map((cat) => (
            <button
              key={cat.label}
              onClick={() => navigate(cat.path)}
              className="rounded-2xl text-left p-6 bg-card border border-border/50 active:scale-[0.98] transition-transform duration-200 touch-manipulation"
              style={{ minHeight: 100 }}
            >
              <span className="text-[15px] font-medium text-foreground">
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Wide — Vegetables & Fruits */}
        <button
          onClick={() => navigate(wide.path)}
          className="w-full rounded-2xl text-left p-6 bg-card border border-border/50 active:scale-[0.98] transition-transform duration-200 touch-manipulation"
          style={{ minHeight: 80 }}
        >
          <span className="text-[15px] font-medium text-foreground">
            {wide.label}
          </span>
          {wide.subtitle && (
            <p className="text-[12px] text-muted-foreground mt-1 font-normal">
              {wide.subtitle}
            </p>
          )}
        </button>
      </div>
    </section>
  );
}
