import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, Store, Package, LogIn } from "lucide-react";

const sb = supabase as any;

const CATEGORY_CONFIG: Record<string, { emoji: string; label: string }> = {
  grocery:    { emoji: "🛒", label: "Grocery"    },
  vegetables: { emoji: "🥦", label: "Vegetables" },
  meat:       { emoji: "🍖", label: "Meat"        },
  pharmacy:   { emoji: "💊", label: "Pharmacy"   },
  bakery:     { emoji: "🍞", label: "Bakery"      },
  dairy:      { emoji: "🥛", label: "Dairy"       },
  general:    { emoji: "🏪", label: "General"     },
};

export function PublicShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate   = useNavigate();

  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["public-shop", shopId],
    enabled: !!shopId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("shops")
        .select("id, name, category, description, logo_url, phone, towns(name)")
        .eq("id", shopId)
        .eq("is_approved", true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["public-shop-items", shopId],
    enabled: !!shopId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("items")
        .select("id, name, name_te, price, unit, image_url")
        .eq("shop_id", shopId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  }) as { data: any[]; isLoading: boolean };

  const isLoading = shopLoading || itemsLoading;
  const cat = shop ? (CATEGORY_CONFIG[shop.category] ?? { emoji: "🏪", label: shop.category }) : null;

  if (isLoading) {
    return (
      <MobileLayout navType="customer">
        <div className="px-4 pt-6 space-y-3">
          <div className="h-36 rounded-2xl bg-muted animate-pulse" />
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      </MobileLayout>
    );
  }

  if (!shop) {
    return (
      <MobileLayout navType="customer">
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
          <Store className="w-12 h-12 text-muted-foreground" />
          <p className="text-base font-bold text-foreground">Shop not found</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout navType="customer">
      <div className="min-h-screen pb-32">

        {/* ── Banner ── */}
        <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
          {shop.logo_url
            ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            : <span className="text-6xl">{cat?.emoji}</span>
          }
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* ── Shop info ── */}
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-black text-foreground">{shop.name}</h1>
          {shop.description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{shop.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {cat && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {cat.emoji} {cat.label}
              </span>
            )}
            {shop.towns?.name && (
              <span className="text-xs text-muted-foreground">{shop.towns.name}</span>
            )}
          </div>
        </div>

        {/* ── Login CTA banner ── */}
        <div className="mx-4 mb-4 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 flex items-center gap-3">
          <LogIn className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-foreground flex-1">
            <span className="font-bold">Sign in to order</span> — prices and ordering available after login
          </p>
          <button
            onClick={() => navigate("/login")}
            className="text-xs font-black text-primary flex-shrink-0"
          >
            Login →
          </button>
        </div>

        {/* ── Items preview ── */}
        <div className="px-4 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            {items.length} Products Available
          </p>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted-foreground">No products listed yet</p>
            </div>
          ) : items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                {item.name_te && (
                  <p className="text-xs text-muted-foreground truncate">{item.name_te}</p>
                )}
                <p className="text-xs text-muted-foreground">{item.unit}</p>
              </div>
              {/* Price blurred until login */}
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-black text-foreground blur-sm select-none">₹{item.price}</p>
                <p className="text-[10px] text-muted-foreground">Login to order</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Sticky login CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <button
          onClick={() => navigate("/login")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all"
        >
          <LogIn className="w-5 h-5" />
          Login to Place Order
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="w-full text-center text-xs text-muted-foreground mt-2 py-1"
        >
          New customer? <span className="text-primary font-bold">Sign up free</span>
        </button>
      </div>
    </MobileLayout>
  );
}