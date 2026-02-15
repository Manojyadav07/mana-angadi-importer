import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useShops } from '@/hooks/useShops';
import { ArrowLeft, Search, Star, MapPin, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

import shopFood1 from '@/assets/shop-food-1.jpg';
import shopGrocery1 from '@/assets/shop-grocery-1.jpg';
import shopMedical1 from '@/assets/shop-medical-1.jpg';
import shopVegetables1 from '@/assets/shop-vegetables-1.jpg';

const CATEGORY_MAP: Record<string, { title_en: string; title_te: string; shopTypes: string[] }> = {
  food: { title_en: 'Food & Restaurants', title_te: 'ఆహారం & హోటళ్లు', shopTypes: ['restaurant'] },
  groceries: { title_en: 'General Stores', title_te: 'జనరల్ స్టోర్లు', shopTypes: ['kirana'] },
  pharmacy: { title_en: 'Medical Shops', title_te: 'మెడికల్ షాపులు', shopTypes: ['medical'] },
  vegetables: { title_en: 'Vegetables & Fruits', title_te: 'కూరగాయలు & పండ్లు', shopTypes: ['kirana'] },
};

const SHOP_IMAGES: Record<string, string> = {
  restaurant: shopFood1,
  kirana: shopGrocery1,
  medical: shopMedical1,
};

const FILTER_CHIPS = [
  { key: 'all', en: 'All', te: 'అన్నీ' },
  { key: 'nearby', en: 'Nearby', te: 'సమీపంలో' },
  { key: 'coop', en: 'Rythu Co-ops', te: 'రైతు సహకార' },
  { key: 'artisan', en: 'Local Artisans', te: 'స్థానిక కళాకారులు' },
];

function getMockEnrichment(shopName: string) {
  const hash = shopName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    rating: 4 + (hash % 9) / 10,
    distance: `${(1 + (hash % 40) / 10).toFixed(1)} km`,
    tagline_en: hash % 2 === 0 ? 'Fresh from the village, served with love' : 'Trusted by families since generations',
    tagline_te: hash % 2 === 0 ? 'గ్రామం నుండి తాజాగా, ప్రేమతో వడ్డించబడింది' : 'తరాల నుండి కుటుంబాలు నమ్ముతున్నారు',
    isOpen: hash % 5 !== 0,
  };
}

export function ShopListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { data: shops = [], isLoading } = useShops();
  const [activeFilter, setActiveFilter] = useState('all');

  const category = searchParams.get('category') || '';
  const catInfo = CATEGORY_MAP[category];

  const filteredShops = useMemo(() => {
    let list = shops.filter((s) => s.isActive);
    if (catInfo) {
      list = list.filter((s) => catInfo.shopTypes.includes(s.type));
    }
    return list;
  }, [shops, catInfo]);

  const getShopImage = (shop: any) => {
    if (category === 'vegetables') return shopVegetables1;
    return SHOP_IMAGES[shop.type] || shopGrocery1;
  };

  return (
    <MobileLayout>
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-mana-cream/95 backdrop-blur-sm border-b border-border/50">
        {/* Top Row */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <button
            onClick={() => navigate('/categories')}
            className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 text-mana-charcoal" />
          </button>

          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            {language === 'en' ? 'Mana Village' : 'మన గ్రామం'}
          </span>

          <button className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center touch-manipulation">
            <Search className="w-5 h-5 text-mana-charcoal" />
          </button>
        </div>

        {/* Title */}
        <div className="px-5 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-mana-charcoal font-display">
            {language === 'en' ? 'Select Your Shop' : 'మీ అంగడి ఎంచుకోండి'}
          </h1>
        </div>
      </header>

      {/* Filter Chips */}
      <section className="px-5 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors touch-manipulation ${
                activeFilter === chip.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white border border-mana-charcoal/5 text-mana-charcoal'
              }`}
            >
              {language === 'en' ? chip.en : chip.te}
            </button>
          ))}
        </div>
      </section>

      {/* Shop List */}
      <section className="px-5 pt-3 pb-24">
        {isLoading ? (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-secondary/40 animate-pulse h-72" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm font-display italic">
              {language === 'en' ? 'No shops found in this category' : 'ఈ విభాగంలో అంగడులు కనుగొనబడలేదు'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredShops.map((shop) => {
              const enrichment = getMockEnrichment(shop.name_en);
              const shopName = language === 'en' ? shop.name_en : shop.name_te;
              const tagline = language === 'en' ? enrichment.tagline_en : enrichment.tagline_te;

              return (
                <div
                  key={shop.id}
                  className="rounded-xl bg-white border border-mana-charcoal/5 shadow-sm overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={getShopImage(shop)}
                      alt={shopName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Open badge */}
                    {enrichment.isOpen && (
                      <span className="absolute top-3 right-3 bg-white/95 text-primary text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                        {language === 'en' ? 'Open Now' : 'తెరిచి ఉంది'}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Row 1: Name + Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-mana-charcoal font-display leading-tight">
                        {shopName}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-sm font-semibold text-mana-charcoal">
                          {enrichment.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Tagline */}
                    <p className="text-sm text-muted-foreground italic font-display mt-1 leading-relaxed">
                      {tagline}
                    </p>

                    {/* Row 3: Distance + Explore */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{enrichment.distance}</span>
                      </div>

                      <button
                        onClick={() => navigate(`/shop/${shop.id}`)}
                        className="btn-primary-pill text-xs px-5 py-2 flex items-center gap-1"
                      >
                        {language === 'en' ? 'Explore' : 'చూడండి'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </MobileLayout>
  );
}
