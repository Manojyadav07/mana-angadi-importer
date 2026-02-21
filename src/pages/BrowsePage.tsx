import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrowseShops, useBrowseItems, BrowseItem } from '@/hooks/useBrowse';
import { useLanguage } from '@/context/LanguageContext';
import { ItemDetailSheet } from '@/components/browse/ItemDetailSheet';
import { Search, Store, Loader2, Package, ChevronRight } from 'lucide-react';

export function BrowsePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [search, setSearch] = useState('');
  const [shopFilter, setShopFilter] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<BrowseItem | null>(null);

  const { data: shops = [], isLoading: shopsLoading } = useBrowseShops();
  const { data: items = [], isLoading: itemsLoading } = useBrowseItems(search, shopFilter);

  return (
    <div className="screen-shell pb-8">
      {/* ═══ HEADER ═══ */}
      <header className="px-5 pt-8 pb-4 bg-mana-cream">
        <h1 className="text-2xl font-semibold text-foreground">
          {language === 'te' ? 'మన అంగడి' : 'Mana Angadi'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'te' ? 'మీ ఊరి దుకాణాలు & వస్తువులు' : 'Your village shops & items'}
        </p>
      </header>

      {/* ═══ SHOPS — HORIZONTAL SCROLL ═══ */}
      <section className="px-5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">
            {language === 'te' ? 'దుకాణాలు' : 'Shops'}
          </h2>
        </div>

        {shopsLoading ? (
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-28 h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            {language === 'te' ? 'దుకాణాలు ఇంకా లేవు' : 'No shops yet'}
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {shops.map(shop => (
              <button
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="flex-shrink-0 w-28 shop-card-active flex flex-col items-center gap-2 p-3"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground truncate w-full text-center">{shop.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="divider-section my-5" />

      {/* ═══ ITEMS SECTION ═══ */}
      <section className="px-5">
        <h2 className="text-base font-semibold text-foreground mb-3">
          {language === 'te' ? 'వస్తువులు' : 'Items'}
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'te' ? 'పేరు ద్వారా వెతకండి...' : 'Search by name...'}
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Shop filter dropdown */}
        <div className="mb-4">
          <select
            value={shopFilter ?? ''}
            onChange={e => setShopFilter(e.target.value || null)}
            className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">{language === 'te' ? 'అన్ని దుకాణాలు' : 'All Shops'}</option>
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
        </div>

        {/* Items list */}
        {itemsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {language === 'te' ? 'వస్తువులు కనుగొనబడలేదు' : 'No items found'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="w-full bg-card rounded-xl p-4 flex items-center gap-4 shadow-sm border border-border active:scale-[0.99] transition-transform text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
                  {item.shop_name && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.shop_name}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-foreground flex-shrink-0">₹{item.price}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Item Detail Sheet */}
      <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
