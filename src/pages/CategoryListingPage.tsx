import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Search, ArrowRight } from 'lucide-react';

import categoryFood from '@/assets/category-food.jpg';
import categoryGroceries from '@/assets/category-groceries.jpg';
import categoryPharmacy from '@/assets/category-pharmacy.jpg';
import categoryVegetables from '@/assets/category-vegetables.jpg';
import categoryDairy from '@/assets/category-dairy.jpg';
import categoryHousehold from '@/assets/category-household.jpg';
import categoryArtisans from '@/assets/category-artisans.jpg';
import categoryRythu from '@/assets/category-rythu.jpg';

interface CategoryDef {
  title_en: string;
  title_te: string;
  slug: string;
  image: string;
}

const CATEGORIES: CategoryDef[] = [
  { title_en: 'Food', title_te: 'భోజనం', slug: 'food', image: categoryFood },
  { title_en: 'Groceries', title_te: 'కిరాణా', slug: 'groceries', image: categoryGroceries },
  { title_en: 'Pharmacy', title_te: 'మందుల షాపు', slug: 'pharmacy', image: categoryPharmacy },
  { title_en: 'Vegetables & Fruits', title_te: 'కూరగాయలు & పండ్లు', slug: 'vegfruits', image: categoryVegetables },
  { title_en: 'Dairy & Fresh', title_te: 'పాల ఉత్పత్తులు', slug: 'dairyfresh', image: categoryDairy },
  { title_en: 'Household', title_te: 'ఇంటి సామాను', slug: 'households', image: categoryHousehold },
  { title_en: 'Artisans', title_te: 'చేతివృత్తులు', slug: 'artisans', image: categoryArtisans },
  { title_en: 'Rythu Crops', title_te: 'రైతు పంటలు', slug: 'rythucrops', image: categoryRythu },
];

export function CategoryListingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const title = language === 'en' ? 'Explore Categories' : 'కేటగిరీలు చూడండి';
  const exploreLabel = language === 'en' ? 'EXPLORE' : 'చూడండి';

  return (
    <MobileLayout>
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-mana-cream/95 backdrop-blur-sm border-b border-mana-charcoal/5 px-5 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 text-mana-charcoal" />
          </button>
          <h1 className="text-lg font-medium font-display text-mana-charcoal">
            {title}
          </h1>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation">
            <Search className="w-5 h-5 text-mana-charcoal" />
          </button>
        </div>
      </header>

      {/* Category Grid */}
      <section className="px-5 pt-5 pb-32">
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const title = language === 'en' ? cat.title_en : cat.title_te;

            return (
              <button
                key={cat.slug}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group flex flex-col rounded-xl bg-white border border-mana-charcoal/5 shadow-sm overflow-hidden text-left active:scale-95 transition-transform duration-200 touch-manipulation"
              >
                {/* Image */}
                <div className="aspect-[4/4.5] w-full overflow-hidden">
                  <img
                    src={cat.image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className="block text-[17px] font-semibold font-display text-mana-charcoal leading-tight">
                    {title}
                  </span>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-primary">
                      {exploreLabel}
                    </span>
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </MobileLayout>
  );
}
