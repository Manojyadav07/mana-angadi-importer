import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle, ChevronLeft, Package, Store,
  RefreshCw, Search, ArrowUpRight,
} from "lucide-react";
import { useNavigate as useNav } from "react-router-dom";

const sb = supabase as any;

type AlertLevel = "out" | "low";

function useInventoryAlerts() {
  return useQuery({
    queryKey: ["admin-inventory-alerts"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("items")
        .select("id, name_en, stock, low_stock_threshold, is_available, shop_id, shops(name_en, id)")
        .eq("is_active", true)
        .order("stock", { ascending: true });
      if (error) throw error;
      return (data ?? []).filter((item: any) =>
        item.stock === 0 || item.stock <= item.low_stock_threshold
      ) as any[];
    },
  });
}

export function AdminInventoryAlertsPage() {
  const navigate = useNavigate();
  const { data: alerts, isLoading, refetch } = useInventoryAlerts();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<AlertLevel | "all">("all");

  const filtered = (alerts ?? []).filter((a: any) => {
    const matchSearch = !search.trim() ||
      a.name_en?.toLowerCase().includes(search.toLowerCase()) ||
      a.shops?.name_en?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "out" ? a.stock === 0 :
      a.stock > 0 && a.stock <= a.low_stock_threshold;
    return matchSearch && matchFilter;
  });

  const outCount = (alerts ?? []).filter((a: any) => a.stock === 0).length;
  const lowCount = (alerts ?? []).filter((a: any) => a.stock > 0 && a.stock <= a.low_stock_threshold).length;

  return (
    <MobileLayout navType="admin">
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Admin</p>
            <h1 className="text-2xl font-bold text-foreground">Inventory Alerts</h1>
          </div>
        </div>
        <button onClick={() => refetch()} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      <div className="px-4 pb-28 space-y-4">
        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total Alerts", value: (alerts ?? []).length, bg: "bg-card",       text: "text-foreground"   },
            { label: "Out of Stock", value: outCount,              bg: "bg-red-50",     text: "text-red-700"      },
            { label: "Low Stock",    value: lowCount,              bg: "bg-amber-50",   text: "text-amber-700"    },
          ].map((c) => (
            <div key={c.label} className={`${c.bg} border border-border rounded-2xl p-3 text-center shadow-sm`}>
              {isLoading
                ? <div className="h-5 w-8 bg-muted animate-pulse rounded mx-auto" />
                : <p className={`text-xl font-black ${c.text}`}>{c.value}</p>
              }
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or shop..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {/* Filter tabs */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {([
            { key: "all", label: "All" },
            { key: "out", label: "Out of Stock" },
            { key: "low", label: "Low Stock" },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all ${filter === t.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Alert list */}
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2"><div className="h-4 bg-muted rounded animate-pulse w-2/3" /><div className="h-3 bg-muted rounded animate-pulse w-1/2" /></div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-bold text-foreground text-sm">No alerts found</p>
            <p className="text-xs text-muted-foreground mt-1">All products are well stocked</p>
          </div>
        ) : filtered.map((a: any) => {
          const isOut = a.stock === 0;
          return (
            <div key={a.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOut ? "bg-red-50" : "bg-amber-50"}`}>
                  <AlertTriangle className={`w-5 h-5 ${isOut ? "text-red-500" : "text-amber-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{a.name_en}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Store className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">{a.shops?.name_en ?? "Unknown shop"}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOut ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                      {isOut ? "Out of Stock" : "Low Stock"}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {a.stock} units {!isOut && `(threshold: ${a.low_stock_threshold})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}





