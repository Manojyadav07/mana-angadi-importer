import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useSlotStatus } from "@/hooks/useSlotStatus";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  ChevronLeft, Plus, Minus, ShoppingCart,
  Package, Clock, AlertCircle, Store,
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmtWeight(kg: number) {
  if (kg < 1) return `${Math.round(kg * 1000)}g`;
  return `${kg}kg`;
}

// ─── item card ────────────────────────────────────────────────────────────────
function ItemCard({
  item,
  shopId,
  shopName,
  qty,
  onAdd,
  onInc,
  onDec,
}: {
  item: any;
  shopId: string;
  shopName: string;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3">
      {/* Image */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-muted-foreground" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground leading-tight truncate">
          {item.name}
        </p>
        {item.name_te && (
          <p className="text-xs text-muted-foreground truncate">{item.name_te}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{item.unit}</span>
          {item.weight_kg > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
              {fmtWeight(item.weight_kg)}
            </span>
          )}
        </div>
        <p className="text-sm font-black text-primary mt-1">₹{item.price}</p>
      </div>

      {/* Add / qty control */}
      <div className="flex-shrink-0">
        {qty === 0 ? (
          <button
            onClick={onAdd}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center active:scale-90 transition-transform shadow-sm"
          >
            <Plus className="w-4 h-4 text-primary-foreground" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={onDec}
              className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform"
            >
              <Minus className="w-3.5 h-3.5 text-foreground" />
            </button>
            <span className="w-6 text-center text-sm font-black text-foreground">{qty}</span>
            <button
              onClick={onInc}
              className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center active:scale-90 transition-transform"
            >
              <Plus className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export function ShopPage() {
  const { shopId }  = useParams<{ shopId: string }>();
  const navigate    = useNavigate();
  const { items: cartItems, addItem, updateQty, totalItems, subtotal } = useCart();
  const slotInfo    = useSlotStatus();

  // ── Fetch shop ──────────────────────────────────────────────────────────
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["shop", shopId],
    enabled:  !!shopId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("shops")
        .select("id, name, category, description, logo_url, phone, is_approved, town_id")
        .eq("id", shopId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // ── Fetch items ─────────────────────────────────────────────────────────
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["shop-items", shopId],
    enabled:  !!shopId,
    staleTime: 2 * 60_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("items")
        .select("id, name, name_te, price, weight_kg, unit, stock, image_url")
        .eq("shop_id", shopId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  }) as { data: any[]; isLoading: boolean };

  const isLoading = shopLoading || itemsLoading;

  // ── Cart helpers ─────────────────────────────────────────────────────────
  const getQty = (itemId: string) =>
    cartItems.find((c) => c.id === itemId)?.quantity ?? 0;

  const handleAdd = (item: any) => {
    if (!shop?.is_approved) {
      toast.error("This shop is not available right now");
      return;
    }
    addItem({
      id:        item.id,
      name:      item.name,
      price:     item.price,
      weight_kg: item.weight_kg ?? 0.5,
      shop_id:   shopId!,
      shop_name: shop?.name ?? "Shop",
      image_url: item.image_url ?? null,
    });
    toast.success(`${item.name} added to cart`, { duration: 1200 });
  };

  const handleInc = (item: any) => {
    const cur = getQty(item.id);
    if (item.stock !== null && cur >= item.stock) {
      toast.error("No more stock available");
      return;
    }
    updateQty(item.id, cur + 1);
  };

  const handleDec = (item: any) => {
    const cur = getQty(item.id);
    updateQty(item.id, Math.max(0, cur - 1));
  };

  // ── loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <MobileLayout navType="customer">
        <div className="px-4 pt-6 space-y-3">
          <div className="h-32 rounded-2xl bg-muted animate-pulse" />
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  if (!shop || !shop.is_approved) {
    return (
      <MobileLayout navType="customer">
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
          <Store className="w-12 h-12 text-muted-foreground" />
          <p className="text-base font-bold text-foreground">Shop not available</p>
          <p className="text-sm text-muted-foreground">This shop is not yet open to orders.</p>
          <button onClick={() => navigate(-1)} className="btn-primary mt-2">Go Back</button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout navType="customer">
      <div className="min-h-screen flex flex-col pb-36">

        {/* ── Header ── */}
        <div className="relative">
          {/* Banner */}
          <div className="w-full h-36 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-16 h-16 text-primary/30" />
            )}
          </div>
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* ── Shop info ── */}
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-black text-foreground">{shop.name}</h1>
          {shop.description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {shop.description}
            </p>
          )}
          <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
            {shop.category}
          </span>
        </div>

        {/* ── Slot banner ── */}
        {!slotInfo.isOpen ? (
          <div className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700">
                Ordering is closed right now
              </p>
              <p className="text-xs text-amber-600">
                Next slot: {slotInfo.nextSlotLabel} — opens soon
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-4 mb-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-green-700">
              {slotInfo.label} — Order by {slotInfo.cutoffTime} for {slotInfo.dispatchTime} dispatch
            </p>
          </div>
        )}

        {/* ── Items ── */}
        <div className="px-4 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Package className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-bold text-muted-foreground">No items available</p>
              <p className="text-xs text-muted-foreground">This merchant hasn't added any products yet.</p>
            </div>
          ) : (
            items.map((item: any) => (
              <ItemCard
                key={item.id}
                item={item}
                shopId={shopId!}
                shopName={shop.name}
                qty={getQty(item.id)}
                onAdd={() => handleAdd(item)}
                onInc={() => handleInc(item)}
                onDec={() => handleDec(item)}
              />
            ))
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