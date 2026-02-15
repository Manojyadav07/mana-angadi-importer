import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useShops } from '@/hooks/useShops';
import { ShopType } from '@/types';
import { ArrowLeft, UtensilsCrossed, Store, Cross, Leaf } from 'lucide-react';

interface CategoryDef {
  key: string;
  shopType?: ShopType;
  label_en: string;
  label_te: string;
  subtitle_en: string;
  subtitle_te: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'restaurant',
    shopType: 'restaurant',
    label_en: 'Food',
    label_te: 'భోజనం',
    subtitle_en: 'Restaurants & Bakery',
    subtitle_te: 'హోటళ్లు & బేకరీ',
    icon: UtensilsCrossed,
  },
  {
    key: 'kirana',
    shopType: 'kirana',
    label_en: 'Groceries',
    label_te: 'కిరాణా',
    subtitle_en: 'General Stores',
    subtitle_te: 'జనరల్ స్టోర్లు',
    icon: Store,
  },
  {
    key: 'medical',
    shopType: 'medical',
    label_en: 'Pharmacy',
    label_te: 'మందుల షాపు',
    subtitle_en: 'Medical Shops',
    subtitle_te: 'మెడికల్ షాపులు',
    icon: Cross,
  },
  {
    key: 'vegetables',
    shopType: 'kirana',
    label_en: 'Vegetables & Fruits',
    label_te: 'కూరగాయలు & పండ్లు',
    subtitle_en: 'Farm fresh, locally sourced',
    subtitle_te: 'పొలం నుండి నేరుగా',
    icon: Leaf,
  },
];

export function CategoryListingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: shops = [] } = useShops();

  const getShopCount = (cat: CategoryDef): number => {
    if (!cat.shopType) return 0;
    return shops.filter((s) => s.type === cat.shopType && s.isActive).length;
  };

  const handleCategoryClick = (cat: CategoryDef) => {
    // Navigate to home with a filter — for now just navigate to /home
    // In future, this would go to a filtered shop listing
    navigate('/home');
  };

  const title = language === 'en' ? 'Explore Angadi' : 'అంగడి చూడండి';
  const subtitle = language === 'en' ? 'Choose a category' : 'కేటగిరీ ఎంచుకోండి';

  return (
    <MobileLayout showNav={false}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground font-display">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Category Grid */}
      <section className="px-5 pt-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const label = language === 'en' ? cat.label_en : cat.label_te;
            const sub = language === 'en' ? cat.subtitle_en : cat.subtitle_te;
            const count = getShopCount(cat);
            const countLabel =
              language === 'en'
                ? `${count} shop${count !== 1 ? 's' : ''} available`
                : `${count} అంగడులు`;

            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat)}
                className="group relative flex flex-col items-center text-center rounded-2xl border border-border/60 bg-card p-6 transition-all duration-200 active:scale-[0.97] touch-manipulation hover:border-primary/40 hover:shadow-primary/10 hover:shadow-md"
                style={{ minHeight: 160 }}
              >
                {/* Subtle primary tint background */}
                <div className="absolute inset-0 rounded-2xl bg-primary/[0.04]" />

                {/* Icon */}
                <div className="relative z-10 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Label */}
                <span className="relative z-10 text-[15px] font-semibold text-foreground leading-tight">
                  {label}
                </span>

                {/* Subtitle */}
                <span className="relative z-10 text-[12px] text-muted-foreground mt-1.5 leading-snug">
                  {sub}
                </span>

                {/* Shop count */}
                <span className="relative z-10 text-2xs text-muted-foreground/70 mt-2 font-medium">
                  {countLabel}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </MobileLayout>
  );
}
