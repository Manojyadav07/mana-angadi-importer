// src/pages/MerchantOrdersPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMerchantShop } from "@/hooks/useShops";
import {
  ChevronLeft, RefreshCw, Package,
  Sun, Moon, MapPin,
} from "lucide-react";

const sb = supabase as any;

// ─── matches new order_status enum exactly ────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  placed:     { label: "New Order",   color: "bg-blue-100 text-blue-700"   },
  dispatched: { label: "Dispatched",  color: "bg-amber-100 text-amber-700" },
  delivered:  { label: "Delivered",   color: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelled",   color: "bg-red-100 text-red-700"     },
};

const FILTER_TABS = [
  { key: "all",       label: "All"        },
  { key: "placed",    label: "New"        },
  { key: "dispatched",label: "Dispatched" },
  { key: "delivered", label: "Delivered"  },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]["key"];

function fmt(n: number) { return `₹${n.toFixed(2)}`; }

export function MerchantOrdersPage() {
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { data: shop } = useMerchantShop(user?.id);
  const [filter, setFilter] = useState<FilterKey>("all");

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["merchant-orders", shop?.id, filter],
    enabled:  !!shop?.id,
    staleTime: 30_000,
    queryFn: async () => {
      // Pull order IDs that contain items from this shop
      const { data: orderItemRows, error: oiErr } = await sb
        .from("order_items")
        .select("order_id")
        .eq("shop_id", shop!.id);
      if (oiErr) throw oiErr;

      const orderIds = [...new Set((orderItemRows ?? []).map((r: any) => r.order_id))] as string[];
      if (orderIds.length === 0) return [];

      let q = sb
        .from("orders")
        .select(`
          id, status, slot, subtotal, delivery_fee, bulk_fee, total_amount,
          payment_method, created_at,
          villages ( name ),
          order_items (
            id, quantity, price_snapshot,
            items ( name ),
            shop_id
          )
        `)
        .in("id", orderIds)
        .order("created_at", { ascending: false });

      if (filter !== "all") q = q.eq("status", filter);

      const { data, error } = await q;
      if (error) throw error;

      // For each order, keep only order_items belonging to this shop
      return (data ?? []).map((o: any) => ({
        ...o,
        order_items: (o.order_items ?? []).filter(
          (oi: any) => oi.shop_id === shop!.id
        ),
      }));
    },
  });

  const newCount = (orders).filter((o: any) => o.status === "placed").length;

  return (
    <MobileLayout navType="merchant">
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Merchant</p>
            <h1 className="text-2xl font-bold text-foreground">
              Orders
              {newCount > 0 && (
                <span className="ml-2 text-sm font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {newCount} new
                </span>
              )}
            </h1>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      <div className="px-4 pb-28 space-y-4">

        {/* ── Filter tabs ── */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold text-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Orders from customers will appear here
            </p>
          </div>
        ) : orders.map((o: any) => {
          const statusCfg = STATUS_CONFIG[o.status] ?? { label: o.status, color: "bg-muted text-muted-foreground" };
          const myItems   = o.order_items ?? [];
          const mySubtotal = myItems.reduce(
            (sum: number, oi: any) => sum + oi.price_snapshot * oi.quantity, 0
          );

          return (
            <div key={o.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-black text-foreground font-mono">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(o.created_at).toLocaleString("en-IN", {
                      day: "2-digit", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>

              {/* Slot + village */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                  o.slot === "morning" ? "bg-amber-50" : "bg-indigo-50"
                }`}>
                  {o.slot === "morning"
                    ? <Sun  className="w-3 h-3 text-amber-500" />
                    : <Moon className="w-3 h-3 text-indigo-500" />
                  }
                  <span className={`text-[10px] font-bold capitalize ${
                    o.slot === "morning" ? "text-amber-700" : "text-indigo-700"
                  }`}>
                    {o.slot}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{(o.villages as any)?.name ?? "—"}</span>
                </div>
              </div>

              {/* Items from this shop */}
              <div className="space-y-1.5 mb-3">
                {myItems.map((oi: any) => (
                  <div key={oi.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate">
                      ×{oi.quantity} {(oi.items as any)?.name ?? "Item"}
                    </span>
                    <span className="font-semibold text-foreground flex-shrink-0 ml-2">
                      {fmt(oi.price_snapshot * oi.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    o.payment_method === "cod"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {o.payment_method}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {myItems.length} {myItems.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <p className="text-sm font-black text-foreground">{fmt(mySubtotal)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}