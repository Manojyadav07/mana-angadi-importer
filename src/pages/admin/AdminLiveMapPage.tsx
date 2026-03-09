import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin, ChevronLeft, Bike, ShoppingBag,
  RefreshCw, Navigation, Phone, Circle,
} from "lucide-react";

const sb = supabase as any;

function useActiveRiders() {
  return useQuery({
    queryKey: ["admin-active-riders"],
    staleTime: 15_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("profiles")
        .select("id, full_name, phone, avatar_url, is_online, current_lat, current_lng, last_seen")
        .eq("role", "delivery");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

function useActiveOrders() {
  return useQuery({
    queryKey: ["admin-live-orders"],
    staleTime: 15_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("orders")
        .select("id, status, total, shops(name_en), profiles(full_name)")
        .in("status", ["confirmed", "preparing", "out_for_delivery"])
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

function timeAgo(ts: string | null) {
  if (!ts) return "Never";
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmed:        { label: "Confirmed",      color: "text-blue-600",   bg: "bg-blue-50"   },
  preparing:        { label: "Preparing",      color: "text-amber-600",  bg: "bg-amber-50"  },
  out_for_delivery: { label: "Out for Delivery",color: "text-green-600", bg: "bg-green-50"  },
};

export function AdminLiveMapPage() {
  const navigate = useNavigate();
  const { data: riders,  isLoading: ridersLoading,  refetch: refetchRiders  } = useActiveRiders();
  const { data: orders,  isLoading: ordersLoading,  refetch: refetchOrders  } = useActiveOrders();
  const [tab, setTab] = useState<"riders" | "orders">("riders");

  const activeRiders  = (riders  ?? []).filter((r: any) => r.is_online);
  const offlineRiders = (riders  ?? []).filter((r: any) => !r.is_online);

  const handleRefresh = () => { refetchRiders(); refetchOrders(); };

  return (
    <MobileLayout navType="admin">
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Admin</p>
            <h1 className="text-2xl font-bold text-foreground">Live View</h1>
          </div>
        </div>
        <button onClick={handleRefresh} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      <div className="px-4 pb-28 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Online Riders", value: activeRiders.length,  bg: "bg-green-50",  text: "text-green-700"  },
            { label: "Live Orders",   value: (orders ?? []).length, bg: "bg-blue-50",   text: "text-blue-700"   },
            { label: "Total Riders",  value: (riders ?? []).length, bg: "bg-card",      text: "text-foreground" },
          ].map((c) => (
            <div key={c.label} className={`${c.bg} border border-border rounded-2xl p-3 text-center shadow-sm`}>
              {ridersLoading
                ? <div className="h-5 w-8 bg-muted animate-pulse rounded mx-auto" />
                : <p className={`text-xl font-black ${c.text}`}>{c.value}</p>
              }
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Map placeholder */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="h-48 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-32 h-0.5 bg-gray-400 rotate-12" />
              <div className="absolute top-10 left-4 w-20 h-0.5 bg-gray-400 -rotate-6" />
              <div className="absolute top-20 left-12 w-40 h-0.5 bg-gray-400 rotate-3" />
              <div className="absolute top-30 left-6 w-28 h-0.5 bg-gray-400 rotate-15" />
              <div className="absolute top-8 right-10 w-24 h-0.5 bg-gray-400 -rotate-12" />
            </div>
            {activeRiders.slice(0, 5).map((r: any, i: number) => (
              <div key={r.id} className="absolute"
                style={{ top: `${20 + i * 15}%`, left: `${15 + (i * 17) % 70}%` }}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center">
                    <Bike className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500" />
                </div>
              </div>
            ))}
            {activeRiders.length === 0 && (
              <div className="text-center z-10">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">No riders online</p>
              </div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {activeRiders.length} rider{activeRiders.length !== 1 ? "s" : ""} online
            </p>
            <p className="text-[10px] text-muted-foreground">Live GPS · Auto-refreshes 30s</p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {(["riders", "orders"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all capitalize ${tab === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
              {t === "riders" ? `Riders (${(riders ?? []).length})` : `Live Orders (${(orders ?? []).length})`}
            </button>
          ))}
        </div>

        {/* Riders list */}
        {tab === "riders" && (
          <div className="space-y-3">
            {[
              { items: activeRiders,  heading: "Online",  dotColor: "bg-green-500"  },
              { items: offlineRiders, heading: "Offline", dotColor: "bg-slate-400"  },
            ].map(({ items, heading, dotColor }) =>
              items.length > 0 ? (
                <div key={heading}>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">{heading}</p>
                  <div className="space-y-2">
                    {items.map((r: any) => (
                      <div key={r.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                              {r.avatar_url
                                ? <img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
                                : <Bike className="w-5 h-5 text-muted-foreground" />
                              }
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${dotColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{r.full_name ?? "Rider"}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {r.current_lat && r.current_lng ? (
                                <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                  <Navigation className="w-2.5 h-2.5" /> Location available
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Last seen: {timeAgo(r.last_seen)}</span>
                              )}
                            </div>
                          </div>
                          {r.phone && (
                            <a href={`tel:${r.phone}`}
                              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
            {(riders ?? []).length === 0 && !ridersLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Bike className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No delivery partners yet</p>
              </div>
            )}
          </div>
        )}

        {/* Live orders list */}
        {tab === "orders" && (
          <div className="space-y-3">
            {ordersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4">
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              ))
            ) : (orders ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No live orders right now</p>
              </div>
            ) : (orders ?? []).map((o: any) => {
              const cfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.confirmed;
              return (
                <div key={o.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-sm font-bold text-foreground">₹{o.total}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{o.shops?.name_en ?? "Shop"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{o.profiles?.full_name ?? "Customer"}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1.5">{o.id.slice(0, 8).toUpperCase()}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}





