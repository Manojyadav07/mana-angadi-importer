import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Search, MapPin, ChevronRight, Star, Clock, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/layout/BottomNav';

import shopFood1 from '@/assets/shop-food-1.jpg';
import shopGrocery1 from '@/assets/shop-grocery-1.jpg';
import shopMedical1 from '@/assets/shop-medical-1.jpg';
import shopVegetables1 from '@/assets/shop-vegetables-1.jpg';

const BANNER_IMAGES = [shopGrocery1, shopFood1, shopMedical1, shopVegetables1];

/** Maps categoryKey → allowed shop_type values */
const CATEGORY_TYPE_MAP: Record<string, string[]> = {
  food: ['restaurant', 'bakery', 'fast_food', 'tiffin', 'hotel'],
  groceries: ['grocery', 'kirana', 'general_store', 'supermarket'],
  pharmacy: ['pharmacy', 'medical', 'chemist'],
  vegfruits: ['vegetables', 'fruits', 'vegfruits'],
};

const SUPPORTED_KEYS = Object.keys(CATEGORY_TYPE_MAP);
const COMING_SOON_KEYS = ['dairyfresh', 'households', 'artisans', 'rythucrops'];

const CATEGORY_TITLES: Record<string, { en: string; te: string }> = {
  food: { en: 'Food', te: 'భోజనం' },
  groceries: { en: 'Groceries', te: 'కిరాణా' },
  pharmacy: { en: 'Pharmacy', te: 'మందుల షాపు' },
  vegfruits: { en: 'Vegetables & Fruits', te: 'కూరగాయలు & పండ్లు' },
  dairyfresh: { en: 'Dairy & Fresh', te: 'పాల ఉత్పత్తులు' },
  households: { en: 'Household', te: 'ఇంటి సామాను' },
  artisans: { en: 'Artisans', te: 'చేతివృత్తులు' },
  rythucrops: { en: 'Rythu Crops', te: 'రైతు పంటలు' },
};

interface ShopRow {
  id: string;
  name: string;
  address: string | null;
  shop_type: string | null;
  created_at: string | null;
}

function getShopBanner(name: string): string {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return BANNER_IMAGES[hash % BANNER_IMAGES.length];
}

function getMockRating(name: string): number {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 4 + (hash % 9) / 10;
}

export function CategoryShopsPage() {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const isComingSoon = COMING_SOON_KEYS.includes(categoryKey ?? '');
  const isSupported = SUPPORTED_KEYS.includes(categoryKey ?? '');

  const titleObj = CATEGORY_TITLES[categoryKey ?? ''] ?? { en: 'Category', te: 'వర్గం' };
  const pageTitle = language === 'en' ? titleObj.en : titleObj.te;

  // ── Coming Soon ──
  if (isComingSoon) {
    return (
      <div className="mobile-container bg-mana-cream min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-mana-charcoal/5">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate('/categories')}
              className="w-9 h-9 rounded-full bg-mana-cream flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-mana-charcoal" />
            </button>
            <h1 className="text-lg font-semibold text-mana-charcoal font-display">{pageTitle}</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <Clock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-mana-charcoal font-display">
            {language === 'en' ? 'Local partners coming soon' : 'స్థానిక భాగస్వాములు త్వరలో వస్తారు'}
          </h2>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs">
            {language === 'en'
              ? 'We are onboarding trusted sellers in your village. Check back shortly or explore other categories.'
              : 'మీ గ్రామంలో నమ్మకమైన విక్రేతలను చేర్చుకుంటున్నాము. కొద్దిసేపట్లో తిరిగి తనిఖీ చేయండి లేదా ఇతర వర్గాలను అన్వేషించండి.'}
          </p>
          <button
            onClick={() => navigate('/categories')}
            className="btn-primary-pill text-sm px-6 py-2.5 mt-6"
          >
            {language === 'en' ? 'Explore Other Categories' : 'ఇతర వర్గాలను చూడండి'}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── Not a known key — redirect back ──
  if (!isSupported) {
    return (
      <div className="mobile-container bg-mana-cream min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Unknown category</p>
      </div>
    );
  }

  // ── Shops listing for supported categories ──
  return <CategoryShopsList categoryKey={categoryKey!} pageTitle={pageTitle} />;
}

/** Inner component that fetches & renders shops for a supported category */
function CategoryShopsList({ categoryKey, pageTitle }: { categoryKey: string; pageTitle: string }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');

  const shopTypes = CATEGORY_TYPE_MAP[categoryKey] ?? [];

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, address, shop_type, created_at')
        .in('shop_type', shopTypes)
        .order('created_at', { ascending: false });
      if (!error && data) setShops(data as ShopRow[]);
      setIsLoading(false);
    }
    load();
  }, [categoryKey]);

  const filteredShops = useMemo(() => {
    if (!search.trim()) return shops;
    const q = search.trim().toLowerCase();
    return shops.filter((s) => s.name.toLowerCase().includes(q));
  }, [shops, search]);

  return (
    <div className="mobile-container bg-mana-cream min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-mana-charcoal/5">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <button
            onClick={() => navigate('/categories')}
            className="w-9 h-9 rounded-full bg-mana-cream flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-mana-charcoal" />
          </button>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold">
              Yadadri Bhuvanagiri
            </span>
          </div>

          <button
            onClick={() => setSearchOpen((o) => !o)}
            className="w-9 h-9 rounded-full bg-mana-cream flex items-center justify-center"
          >
            {searchOpen ? (
              <X className="w-[18px] h-[18px] text-mana-charcoal" />
            ) : (
              <Search className="w-[18px] h-[18px] text-mana-charcoal" />
            )}
          </button>
        </div>

        <div className="px-5 pb-2">
          <h1 className="text-[22px] font-semibold tracking-tight text-mana-charcoal font-display">
            {pageTitle}
          </h1>
        </div>

        {searchOpen && (
          <div className="px-4 pb-3">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'en' ? 'Search shops…' : 'అంగడి వెతకండి…'}
              className="w-full h-10 rounded-full bg-mana-cream border border-mana-charcoal/10 px-4 text-sm text-mana-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
      </header>

      {/* Shop cards */}
      <section className="px-4 pt-4 pb-36">
        {isLoading ? (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-white animate-pulse h-72 border border-mana-charcoal/5" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <Search className="w-14 h-14 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold text-mana-charcoal font-display">
              {language === 'en' ? 'No shops found' : 'అంగడులు కనుగొనబడలేదు'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'en'
                ? 'No shops in this category yet. Check back soon!'
                : 'ఈ వర్గంలో ఇంకా అంగడులు లేవు. త్వరలో తిరిగి తనిఖీ చేయండి!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredShops.map((shop) => {
              const rating = getMockRating(shop.name);
              return (
                <div
                  key={shop.id}
                  className="rounded-xl bg-white border border-mana-charcoal/5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={getShopBanner(shop.name)}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-3 right-3 bg-white/95 text-primary text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm">
                      {language === 'en' ? 'Open Now' : 'తెరిచి ఉంది'}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-mana-charcoal font-display leading-tight">
                        {shop.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-sm font-semibold text-mana-charcoal">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground italic font-display mt-1 leading-relaxed">
                      {language === 'en'
                        ? 'Local village store & daily essentials'
                        : 'స్థానిక గ్రామ దుకాణం & దైనందిన అవసరాలు'}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {language === 'en' ? 'Nearby' : 'సమీపంలో'}
                        </span>
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

      <BottomNav />
    </div>
  );
}
