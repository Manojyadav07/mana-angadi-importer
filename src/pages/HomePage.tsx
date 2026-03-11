import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useSlotStatus } from "@/hooks/useSlotStatus";
import {
  Search, ShoppingCart, Sun, Moon, Clock,
  Store, ChevronRight, Package,
} from "lucide-react";

const sb = supabase as any;

// ─── category config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { emoji: string; label: string }> = {
  grocery:    { emoji: "🛒", label: "Grocery"    },
  vegetables: { emoji: "🥦", label: "Vegetables" },
  meat:       { emoji: "🍖", label: "Meat"        },
  pharmacy:   { emoji: "💊", label: "Pharmacy"   },
  bakery:     { emoji: "🍞", label: "Bakery"      },
  dairy:      { emoji: "🥛", label: "Dairy"       },
  general:    { emoji: "🏪", label: "General"     },
};

// ─── sub-components ───────────────────────────────────────────────────────────
function SlotBanner() {
  const slot = useSlotStatus();
  if (slot.isOpen) {
    const Icon = slot.slot === "morning" ? Sun : Moon;
    const colors = slot.slot === "morning"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-indigo-50 border-indigo-200 text-indigo-700";
    return (
      <div className={`mx-4 mb-4 border rounded-2xl px-4 py-3 flex items-center gap-3 ${colors}`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black">{slot.label} is open</p>
          <p className="text-[11px] opacity-80">Order by {slot.cutoffTime} · Dispatch {slot.dispatchTime}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-4 mb-4 border border-border bg-muted/50 rounded-2xl px-4 py-3 flex items-center gap-3">
      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div>
        <p className="text-xs font-black text-foreground">Ordering is closed</p>
        <p className="text-[11px] text-muted-foreground">Next: {slot.nextSlotLabel}</p>
      </div>
    </div>
  );
}

function ShopCard({ shop, onClick }: { shop: any; onClick: () => void }) {
  const cat = CATEGORY_CONFIG[shop.category] ?? { emoji: "🏪", label: shop.category };
  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-2xl p-4 text-left active:scale-[0.98] transition-transform shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
          {shop.logo_url
            ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            : <span className="text-2xl">{cat.emoji}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-foreground truncate">{shop.name}</p>
          {shop.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{shop.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
              {cat.emoji} {cat.label}
            </span>
            {shop.towns?.name && (
              <span className="text-[10px] text-muted-foreground">{shop.towns.name}</span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </button>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export function HomePage() {
  const navigate          = useNavigate();
  const { user, profile } = useAuth() as any;
  const { totalItems, subtotal } = useCart();
  const [search,     setSearch]     = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // ── Fetch approved shops ─────────────────────────────────────────────────
  const { data: shops = [], isLoading } = useQuery({
    queryKey: ["home-shops"],
    staleTime: 2 * 60_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("shops")
        .select("id, name, category, description, logo_url, towns(name)")
        .eq("is_approved", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  }) as { data: any[]; isLoading: boolean };

  // ── Categories derived from shops ────────────────────────────────────────
  const availableCategories = ["all", ...new Set(shops.map((s: any) => s.category).filter(Boolean))];

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = shops.filter((s: any) => {
    const matchSearch = !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  const displayName = (profile as any)?.display_name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <MobileLayout navType="customer">
      <div className="min-h-screen pb-36">

        {/* ── Header ── */}
        <header className="px-4 pt-8 pb-4">
          <p className="text-sm text-muted-foreground font-medium">Good {greeting()},</p>
          <h1 className="text-2xl font-black text-foreground leading-tight">
            {displayName} 👋
          </h1>
        </header>

        {/* ── Slot banner ── */}
        <SlotBanner />

        {/* ── Search ── */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops or products…"
              className="input-village pl-9"
            />
          </div>
        </div>

        {/* ── Category pills ── */}
        <div className="flex gap-2 px-4 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {availableCategories.map((cat) => {
            const cfg = cat === "all"
              ? { emoji: "🏠", label: "All" }
              : (CATEGORY_CONFIG[cat] ?? { emoji: "🏪", label: cat });
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                <span>{cfg.emoji}</span>
                <span className="capitalize">{cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Shop list ── */}
        <div className="px-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Store className="w-12 h-12 text-muted-foreground opacity-30" />
              <p className="text-sm font-bold text-foreground">
                {search ? "No shops match your search" : "No shops available"}
              </p>
              <p className="text-xs text-muted-foreground">
                {search ? "Try a different keyword" : "Check back soon — more shops coming!"}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-semibold">
                {filtered.length} {filtered.length === 1 ? "shop" : "shops"} available
              </p>
              {filtered.map((shop: any) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onClick={() => navigate(`/shop/${shop.id}`)}
                />
              ))}
            </>
          )}
        </div>

      </div>

      {/* ── Sticky cart bar ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-3 bg-gradient-to-t from-background via-background/95 to-transparent">
          <button
            onClick={() => navigate("/cart")}
            className="w-full flex items-center justify-between bg-primary text-primary-foreground font-black py-4 px-5 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs font-black">{totalItems}</span>
              </div>
              <span className="text-sm">View Cart</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-black">₹{subtotal.toFixed(2)}</span>
              <ShoppingCart className="w-4 h-4 ml-1" />
            </div>
          </button>
        </div>
      )}
    </MobileLayout>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}