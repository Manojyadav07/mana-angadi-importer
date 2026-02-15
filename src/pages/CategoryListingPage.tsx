import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useShops } from '@/hooks/useShops';
import { ShopType } from '@/types';
import { ArrowLeft, UtensilsCrossed, Store, Cross, Leaf } from 'lucide-react';

import categoryFood from '@/assets/category-food.jpg';
import categoryGroceries from '@/assets/category-groceries.jpg';
import categoryPharmacy from '@/assets/category-pharmacy.jpg';
import categoryVegetables from '@/assets/category-vegetables.jpg';

interface CategoryDef {
  key: string;
  shopType?: ShopType;
  label_en: string;
  label_te: string;
  subtitle_en: string;
  subtitle_te: string;
  icon: React.ElementType;
  image: string;
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
    image: categoryFood,
  },
  {
    key: 'kirana',
    shopType: 'kirana',
    label_en: 'Groceries',
    label_te: 'కిరాణా',
    subtitle_en: 'General Stores',
    subtitle_te: 'జనరల్ స్టోర్లు',
    icon: Store,
    image: categoryGroceries,
  },
  {
    key: 'medical',
    shopType: 'medical',
    label_en: 'Pharmacy',
    label_te: 'మందుల షాపు',
    subtitle_en: 'Medical Shops',
    subtitle_te: 'మెడికల్ షాపులు',
    icon: Cross,
    image: categoryPharmacy,
  },
  {
    key: 'vegetables',
    shopType: 'kirana',
    label_en: 'Vegetables & Fruits',
    label_te: 'కూరగాయలు & పండ్లు',
    subtitle_en: 'Farm fresh, locally sourced',
    subtitle_te: 'పొలం నుండి నేరుగా',
    icon: Leaf,
    image: categoryVegetables,
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
    navigate('/home');
  };

  const title = language === 'en' ? 'Explore Angadi' : 'అంగడి చూడండి';
  const subtitle = language === 'en' ? 'Choose a category' : 'కేటగిరీ ఎంచుకోండి';

  return (
    <MobileLayout showNav={false}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-mana-cream/95 backdrop-blur-sm border-b border-border px-5 py-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-mana-charcoal font-display">
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
                className="group relative flex flex-col items-center text-center rounded-xl bg-mana-cream border border-border/60 shadow-sm overflow-hidden transition-shadow duration-200 touch-manipulation hover:border-primary/40 hover:shadow-md hover:shadow-primary/10"
                style={{ minHeight: 160, padding: 24 }}
              >
                {/* Photo texture layer */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${cat.image})`,
                    opacity: 0.12,
                    filter: 'blur(1px) saturate(0.6)',
                  }}
                />

                {/* Content layer */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Label */}
                  <span className="text-[15px] font-semibold text-mana-charcoal leading-tight">
                    {label}
                  </span>

                  {/* Subtitle */}
                  <span className="text-[12px] text-muted-foreground mt-1.5 leading-snug">
                    {sub}
                  </span>

                  {/* Shop count */}
                  <span className="text-[10px] text-muted-foreground/70 mt-2 font-medium">
                    {countLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </MobileLayout>
  );
}
