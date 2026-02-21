import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ItemDetailSheet } from '@/components/browse/ItemDetailSheet';
import { BrowseItem } from '@/hooks/useBrowse';
import { ArrowLeft, Search, Loader2, Package, MapPin } from 'lucide-react';

export function PublicShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<BrowseItem | null>(null);

  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['browse-shop', shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, address')
        .eq('id', shopId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['browse-shop-items', shopId, search],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select('id, name, price, shop_id, is_active, created_at')
        .eq('shop_id', shopId!)
        .eq('is_active', true)
        .order('name')
        .limit(50);

      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((row: any): BrowseItem => ({
        id: row.id,
        name: row.name,
        price: Number(row.price),
        shop_id: row.shop_id,
        is_active: row.is_active ?? true,
        created_at: row.created_at,
        shop_name: shop?.name,
      }));
    },
    enabled: !!shopId,
  });

  const isLoading = shopLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="screen-shell flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="screen-shell flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">{language === 'te' ? 'దుకాణం కనుగొనబడలేదు' : 'Shop not found'}</p>
        <button onClick={() => navigate('/')} className="text-primary text-sm font-medium">
          {language === 'te' ? 'వెనుకకు' : 'Go back'}
        </button>
      </div>
    );
  }

  return (
    <div className="screen-shell pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground truncate flex-1">{shop.name}</h1>
        </div>
      </header>

      {/* Shop info */}
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-xl font-semibold text-foreground">{shop.name}</h2>
        {shop.address && (
          <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{shop.address}</span>
          </div>
        )}
        <div className="divider-section mt-4" />
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'te' ? 'వస్తువులు వెతకండి...' : 'Search items...'}
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Items list */}
      <div className="px-5 space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {language === 'te' ? 'వస్తువులు అందుబాటులో లేవు' : 'No items available'}
            </p>
          </div>
        ) : (
          items.map(item => (
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
              </div>
              <span className="text-sm font-bold text-foreground flex-shrink-0">₹{item.price}</span>
            </button>
          ))
        )}
      </div>

      <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
