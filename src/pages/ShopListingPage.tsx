import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useShops } from '@/hooks/useShops';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Star, Clock, ShoppingBag } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

const CATEGORY_MAP: Record<string, { title_en: string; title_te: string; shopTypes: string[] }> = {
  food: { title_en: 'Food & Restaurants', title_te: 'ఆహారం & హోటళ్లు', shopTypes: ['restaurant'] },
  groceries: { title_en: 'General Stores', title_te: 'జనరల్ స్టోర్లు', shopTypes: ['kirana'] },
  pharmacy: { title_en: 'Medical Shops', title_te: 'మెడికల్ షాపులు', shopTypes: ['medical'] },
  vegetables: { title_en: 'Vegetables & Fruits', title_te: 'కూరగాయలు & పండ్లు', shopTypes: ['kirana'] },
};

// Static mock data for display enrichment (rating, delivery time, etc.)
const MOCK_ENRICHMENT: Record<string, { rating: number; reviews: number; deliveryMin: number; minOrder: number; freeDelivery?: boolean }> = {};

function getMockEnrichment(shopName: string) {
  // Provide plausible defaults for any shop
  const hash = shopName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    rating: 4 + (hash % 9) / 10,
    reviews: 10 + (hash % 90),
    deliveryMin: 10 + (hash % 25),
    minOrder: 50 + (hash % 150),
    freeDelivery: hash % 3 === 0,
  };
}

export function ShopListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { data: shops = [], isLoading } = useShops();
  const [search, setSearch] = useState('');

  const category = searchParams.get('category') || '';
  const catInfo = CATEGORY_MAP[category];

  const title = catInfo
    ? language === 'en' ? catInfo.title_en : catInfo.title_te
    : language === 'en' ? 'All Shops' : 'అన్ని అంగడులు';

  const subtitle = language === 'en'
    ? 'Trusted village merchants near you'
    : 'మీ సమీపంలోని నమ్మకమైన వ్యాపారులు';

  const filteredShops = useMemo(() => {
    let list = shops.filter((s) => s.isActive);

    if (catInfo) {
      list = list.filter((s) => catInfo.shopTypes.includes(s.type));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name_en.toLowerCase().includes(q) ||
          s.name_te.includes(q)
      );
    }

    return list;
  }, [shops, catInfo, search]);

  const typeLabels: Record<string, { en: string; te: string }> = {
    kirana: { en: 'Grocery', te: 'కిరాణా' },
    restaurant: { en: 'Restaurant', te: 'హోటల్' },
    medical: { en: 'Medical', te: 'మెడికల్' },
  };

  const noResultsText = language === 'en' ? 'No shops found' : 'అంగడులు కనుగొనబడలేదు';
  const searchPlaceholder = language === 'en' ? 'Search shops…' : 'అంగడులు వెతకండి…';

  return (
    <MobileLayout>
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-mana-cream/95 backdrop-blur-sm border-b border-border px-5 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/categories')}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-mana-charcoal font-display">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <section className="px-5 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 input-auth"
          />
        </div>
      </section>

      <div className="divider-thin mx-5 mt-4" />

      {/* Shop List */}
      <section className="px-5 pt-4 pb-24">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-secondary/40 animate-pulse h-28" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{noResultsText}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredShops.map((shop) => {
              const enrichment = getMockEnrichment(shop.name_en);
              const shopName = language === 'en' ? shop.name_en : shop.name_te;
              const typeBadge = typeLabels[shop.type]
                ? language === 'en' ? typeLabels[shop.type].en : typeLabels[shop.type].te
                : shop.type;

              return (
                <button
                  key={shop.id}
                  onClick={() => navigate(`/shop/${shop.id}`)}
                  className="flex gap-4 p-4 rounded-xl bg-mana-cream border border-border/60 shadow-sm transition-shadow hover:shadow-md hover:border-primary/30 touch-manipulation text-left w-full"
                >
                  {/* Photo */}
                  <div className="w-20 h-20 rounded-lg bg-secondary/60 flex-shrink-0 overflow-hidden relative">
                    <div className="absolute inset-0 bg-mana-charcoal/5" />
                    <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground/40">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="text-[15px] font-semibold text-mana-charcoal font-display leading-tight truncate">
                      {shopName}
                    </span>

                    <Badge
                      variant="secondary"
                      className="w-fit text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-0 font-medium"
                    >
                      {typeBadge}
                    </Badge>

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        {enrichment.rating.toFixed(1)}
                        <span className="text-muted-foreground/60">({enrichment.reviews})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {enrichment.deliveryMin} min
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        Min ₹{enrichment.minOrder}
                      </span>
                      {enrichment.freeDelivery && (
                        <span className="text-[10px] text-primary font-medium">
                          Free delivery
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </MobileLayout>
  );
}
