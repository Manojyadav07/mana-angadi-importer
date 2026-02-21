import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Search, MapPin, ChevronRight, X, Star } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/layout/BottomNav';

import shopFood1 from '@/assets/shop-food-1.jpg';
import shopGrocery1 from '@/assets/shop-grocery-1.jpg';
import shopMedical1 from '@/assets/shop-medical-1.jpg';
import shopVegetables1 from '@/assets/shop-vegetables-1.jpg';

const BANNER_IMAGES = [shopGrocery1, shopFood1, shopMedical1, shopVegetables1];

const FILTER_CHIPS = [
  { key: 'all', en: 'All', te: 'అన్నీ' },
  { key: 'nearby', en: 'Nearby', te: 'సమీపంలో' },
  { key: 'coop', en: 'Rythu Co-ops', te: 'రైతు సహకార' },
  { key: 'artisan', en: 'Local Artisans', te: 'స్థానిక కళాకారులు' },
];

interface ShopRow {
  id: string;
  name: string;
  address: string | null;
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

export function ShopListingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, address, created_at')
        .order('created_at', { ascending: false });
      if (!error && data) setShops(data as ShopRow[]);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredShops = useMemo(() => {
    let list = shops;

    // search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }

    // chip filter
    if (activeFilter === 'coop') {
      list = list.filter(
        (s) => s.name.toLowerCase().includes('co-op') || s.name.toLowerCase().includes('rythu')
      );
    } else if (activeFilter === 'artisan') {
      list = list.filter(
        (s) => s.name.toLowerCase().includes('art') || s.name.toLowerCase().includes('studio')
      );
    }
    // 'all' and 'nearby' show everything

    return list;
  }, [shops, search, activeFilter]);

  return (
    <div className="mobile-container bg-mana-cream min-h-screen">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-mana-charcoal/5">
        {/* Row 1: back · location · search */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <button
            onClick={() => navigate(-1)}
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

        {/* Title */}
        <div className="px-5 pb-2">
          <h1 className="text-[22px] font-semibold tracking-tight text-mana-charcoal font-display">
            {language === 'en' ? 'Select Your Shop' : 'మీ అంగడి ఎంచుకోండి'}
          </h1>
        </div>

        {/* Search input (toggled) */}
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

        {/* Filter chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={`flex-shrink-0 px-4 py-[7px] rounded-full text-[11px] font-semibold tracking-wide transition-colors ${
                activeFilter === chip.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-white border border-mana-charcoal/8 text-mana-charcoal/70'
              }`}
            >
              {language === 'en' ? chip.en : chip.te}
            </button>
          ))}
        </div>
      </header>

      {/* ── Shop List ── */}
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
                ? 'Try a different search or filter.'
                : 'వేరే శోధన లేదా ఫిల్టర్ ప్రయత్నించండి.'}
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
                  {/* Banner image */}
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

                  {/* Card body */}
                  <div className="p-4">
                    {/* Name + rating */}
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

                    {/* Tagline */}
                    <p className="text-sm text-muted-foreground italic font-display mt-1 leading-relaxed">
                      {language === 'en'
                        ? 'Local village store & daily essentials'
                        : 'స్థానిక గ్రామ దుకాణం & దైనందిన అవసరాలు'}
                    </p>

                    {/* Distance + Explore */}
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

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
