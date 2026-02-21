import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { BottomNav } from '@/components/layout/BottomNav';
import { toast } from 'sonner';
import {
  ArrowLeft, Search, MapPin, X, Plus, Minus, Package, Loader2,
} from 'lucide-react';

interface ShopRow {
  id: string;
  name: string;
  address: string | null;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=60';

interface ItemRow {
  id: string;
  shop_id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_active: boolean | null;
}

interface CartRow {
  id: string;
  item_id: string;
  quantity: number;
}

export function ShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [shop, setShop] = useState<ShopRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [cartItems, setCartItems] = useState<CartRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopNotFound, setShopNotFound] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  // Fetch shop + items + cart
  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      const [shopRes, itemsRes] = await Promise.all([
        supabase.from('shops').select('id, name, address').eq('id', shopId).maybeSingle(),
        supabase.from('items').select('id, shop_id, name, price, image_url, is_active').eq('shop_id', shopId).eq('is_active', true).order('created_at', { ascending: false }),
      ]);

      if (cancelled) return;

      if (!shopRes.data) {
        setShopNotFound(true);
        setIsLoading(false);
        return;
      }

      setShop(shopRes.data as ShopRow);
      setItems((itemsRes.data ?? []) as ItemRow[]);
      setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [shopId]);

  // Fetch user's cart items for this shop
  useEffect(() => {
    if (!user || !shopId) return;

    async function loadCart() {
      const { data } = await supabase
        .from('cart_items')
        .select('id, item_id, quantity')
        .eq('user_id', user!.id)
        .eq('shop_id', shopId!);
      setCartItems((data ?? []) as CartRow[]);
    }

    loadCart();
  }, [user, shopId]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const getCartQty = (itemId: string) => {
    return cartItems.find((c) => c.item_id === itemId)?.quantity ?? 0;
  };

  const handleAdd = async (item: ItemRow) => {
    if (!user) {
      sessionStorage.setItem('post-login-redirect', `/shop/${shopId}`);
      navigate('/login');
      return;
    }

    setAddingId(item.id);
    try {
      const existing = cartItems.find((c) => c.item_id === item.id);
      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
        setCartItems((prev) =>
          prev.map((c) => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c)
        );
      } else {
        const { data } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, item_id: item.id, shop_id: item.shop_id, quantity: 1 })
          .select('id, item_id, quantity')
          .single();
        if (data) setCartItems((prev) => [...prev, data as CartRow]);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(language === 'te' ? 'బుట్టకు జోడించబడింది' : 'Added to basket');
    } catch {
      toast.error(language === 'te' ? 'లోపం సంభవించింది' : 'Something went wrong');
    } finally {
      setAddingId(null);
    }
  };

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    const existing = cartItems.find((c) => c.item_id === itemId);
    if (!existing) return;

    try {
      if (newQty <= 0) {
        await supabase.from('cart_items').delete().eq('id', existing.id);
        setCartItems((prev) => prev.filter((c) => c.id !== existing.id));
      } else {
        await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.id);
        setCartItems((prev) =>
          prev.map((c) => c.id === existing.id ? { ...c, quantity: newQty } : c)
        );
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch {
      toast.error(language === 'te' ? 'లోపం' : 'Error');
    }
  };

  const totalCartItems = cartItems.reduce((s, c) => s + c.quantity, 0);
  const totalCartValue = cartItems.reduce((s, c) => {
    const item = items.find((i) => i.id === c.item_id);
    return s + (item ? item.price * c.quantity : 0);
  }, 0);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="mobile-container bg-mana-cream min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Not found ──
  if (shopNotFound || !shop) {
    return (
      <div className="mobile-container bg-mana-cream min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-mana-charcoal/5">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-mana-cream flex items-center justify-center">
              <ArrowLeft className="w-[18px] h-[18px] text-mana-charcoal" />
            </button>
            <h1 className="text-lg font-semibold text-mana-charcoal font-display">
              {language === 'en' ? 'Shop' : 'అంగడి'}
            </h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <Package className="w-14 h-14 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-mana-charcoal font-display">
            {language === 'en' ? 'Shop not found' : 'అంగడి కనుగొనబడలేదు'}
          </h2>
          <button onClick={() => navigate(-1)} className="btn-primary-pill text-sm px-6 py-2.5 mt-5">
            {language === 'en' ? 'Go Back' : 'వెనుకకు వెళ్ళండి'}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="mobile-container bg-mana-cream min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-mana-charcoal/5">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-mana-cream flex items-center justify-center">
            <ArrowLeft className="w-[18px] h-[18px] text-mana-charcoal" />
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold">Yadadri Bhuvanagiri</span>
          </div>
          <button onClick={() => setSearchOpen((o) => !o)} className="w-9 h-9 rounded-full bg-mana-cream flex items-center justify-center">
            {searchOpen
              ? <X className="w-[18px] h-[18px] text-mana-charcoal" />
              : <Search className="w-[18px] h-[18px] text-mana-charcoal" />}
          </button>
        </div>

        <div className="px-5 pb-1">
          <h1 className="text-[22px] font-semibold tracking-tight text-mana-charcoal font-display">{shop.name}</h1>
          {shop.address && (
            <p className="text-xs text-muted-foreground mt-0.5">{shop.address}</p>
          )}
        </div>

        {searchOpen && (
          <div className="px-4 pb-3 pt-1">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'en' ? 'Search items…' : 'వస్తువులు వెతకండి…'}
              className="w-full h-10 rounded-full bg-mana-cream border border-mana-charcoal/10 px-4 text-sm text-mana-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
      </header>

      {/* ── Items ── */}
      <section className="px-4 pt-4 pb-36">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <Package className="w-14 h-14 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold text-mana-charcoal font-display">
              {language === 'en' ? 'No items available right now' : 'ఇప్పుడు వస్తువులు అందుబాటులో లేవు'}
            </h2>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredItems.map((item) => {
              const qty = getCartQty(item.id);
              const isAdding = addingId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-white border border-mana-charcoal/5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-4 flex items-center gap-4"
                >
                  {/* Icon placeholder */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-mana-cream flex-shrink-0">
                    <img
                      src={item.image_url || FALLBACK_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                    />
                  </div>

                  {/* Name + price */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-mana-charcoal leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm font-bold text-mana-charcoal mt-1">₹{item.price}</p>
                  </div>

                  {/* Add / stepper */}
                  <div className="flex-shrink-0">
                    {qty === 0 ? (
                      <button
                        onClick={() => handleAdd(item)}
                        disabled={isAdding}
                        className="btn-primary-pill text-xs px-4 py-2 flex items-center gap-1 disabled:opacity-60"
                      >
                        {isAdding ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        {language === 'en' ? 'Add' : 'జోడించు'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-primary/10 rounded-full h-9 px-1">
                        <button
                          onClick={() => handleUpdateQty(item.id, qty - 1)}
                          className="w-7 h-7 rounded-full border border-mana-charcoal/10 flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5 text-mana-charcoal" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-mana-charcoal">{qty}</span>
                        <button
                          onClick={() => handleUpdateQty(item.id, qty + 1)}
                          className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Floating basket bar ── */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30 animate-slide-up">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-primary text-primary-foreground rounded-full px-5 py-3 flex items-center justify-between shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <span className="font-medium text-sm">
              {totalCartItems} {totalCartItems === 1 ? (language === 'en' ? 'item' : 'వస్తువు') : (language === 'en' ? 'items' : 'వస్తువులు')}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold">₹{totalCartValue}</span>
              <span className="text-xs opacity-70">
                {language === 'en' ? 'View Basket' : 'బుట్ట చూడండి'} ›
              </span>
            </div>
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
