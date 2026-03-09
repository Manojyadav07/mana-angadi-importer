import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, ShoppingBag, Store, Users,
  ChevronLeft, IndianRupee, Star, Package,
  Bike, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const sb = supabase as any;

type Period = "7d" | "30d" | "90d";

function useDashboardStats(period: Period) {
  return useQuery({
    queryKey: ["admin-analytics", period],
    staleTime: 60_000,
    queryFn: async () => {
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const since = new Date(Date.now() - days * 86400_000).toISOString();

      const [ordersRes, merchantsRes, customersRes, deliveryRes] = await Promise.all([
        sb.from("orders").select("id, total, status, created_at").gte("created_at", since),
        sb.from("shops").select("id, name_en, created_at").eq("is_active", true),
        sb.from("profiles").select("id").eq("role", "customer"),
        sb.from("profiles").select("id").eq("role", "delivery"),
      ]);

      const orders: any[] = ordersRes.data ?? [];
      const merchants: any[] = merchantsRes.data ?? [];
      const customers: any[] = customersRes.data ?? [];
      const deliveryPartners: any[] = deliveryRes.data ?? [];

      // Revenue by day
      const revenueMap: Record<string, number> = {};
      const orderCountMap: Record<string, number> = {};
      orders.forEach((o: any) => {
        const day = o.created_at?.slice(0, 10) ?? "";
        revenueMap[day] = (revenueMap[day] ?? 0) + (o.total ?? 0);
        orderCountMap[day] = (orderCountMap[day] ?? 0) + 1;
      });

      const chartData = Array.from({ length: days }, (_, i) => {
        const d = new Date(Date.now() - (days - 1 - i) * 86400_000);
        const key = d.toISOString().slice(0, 10);
        return {
          date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          revenue: revenueMap[key] ?? 0,
          orders: orderCountMap[key] ?? 0,
        };
      });

      const totalRevenue = orders.reduce((s: number, o: any) => s + (o.total ?? 0), 0);
      const delivered    = orders.filter((o: any) => o.status === "delivered").length;
      const cancelled    = orders.filter((o: any) => o.status === "cancelled").length;
      const deliveryRate = orders.length ? Math.round((delivered / orders.length) * 100) : 0;

      return {
        totalRevenue, totalOrders: orders.length,
        totalMerchants: merchants.length,
        totalCustomers: customers.length,
        totalRiders: deliveryPartners.length,
        deliveryRate, cancelled,
        chartData,
      };
    },
  });
}

function useTopMerchants(period: Period) {
  return useQuery({
    queryKey: ["admin-top-merchants", period],
    staleTime: 60_000,
    queryFn: async () => {
      const days  = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const { data } = await sb
        .from("orders")
        .select("shop_id, total, shops(name_en)")
        .gte("created_at", since)
        .eq("status", "delivered");
      const map: Record<string, { name: string; revenue: number; orders: number }> = {};
      (data ?? []).forEach((o: any) => {
        const id = o.shop_id;
        if (!id) return;
        if (!map[id]) map[id] = { name: o.shops?.name_en ?? "Unknown", revenue: 0, orders: 0 };
        map[id].revenue += o.total ?? 0;
        map[id].orders  += 1;
      });
      return Object.entries(map)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
  });
}

function useTopProducts(period: Period) {
  return useQuery({
    queryKey: ["admin-top-products", period],
    staleTime: 60_000,
    queryFn: async () => {
      const days  = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const { data } = await sb
        .from("order_items")
        .select("item_id, quantity, price, items(name_en)")
        .gte("created_at", since);
      const map: Record<string, { name: string; qty: number; revenue: number }> = {};
      (data ?? []).forEach((r: any) => {
        const id = r.item_id;
        if (!id) return;
        if (!map[id]) map[id] = { name: r.items?.name_en ?? "Unknown", qty: 0, revenue: 0 };
        map[id].qty     += r.quantity ?? 0;
        map[id].revenue += (r.quantity ?? 0) * (r.price ?? 0);
      });
      return Object.entries(map)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
  });
}

export function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("7d");
  const [chart,  setChart]  = useState<"revenue" | "orders">("revenue");

  const { data: stats, isLoading } = useDashboardStats(period);
  const { data: topMerchants }     = useTopMerchants(period);
  const { data: topProducts }      = useTopProducts(period);

  const statCards = [
    { label: "Revenue",   value: `₹${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}k`, icon: IndianRupee, color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Orders",    value: stats?.totalOrders ?? 0,                                 icon: ShoppingBag, color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Merchants", value: stats?.totalMerchants ?? 0,                              icon: Store,       color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Customers", value: stats?.totalCustomers ?? 0,                              icon: Users,       color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <MobileLayout navType="admin">
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Admin</p>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        </div>
      </header>

      <div className="px-4 pb-28 space-y-5">

        {/* Period tabs */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${period === p ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${c.color}`} />
                </div>
                {isLoading
                  ? <div className="h-6 w-16 bg-muted animate-pulse rounded mb-1" />
                  : <p className="text-xl font-black text-foreground">{c.value}</p>
                }
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            );
          })}
        </div>

        {/* Delivery rate + cancelled */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Bike className="w-4 h-4 text-green-600" />
              <p className="text-xs text-muted-foreground font-medium">Delivery Rate</p>
            </div>
            <p className="text-2xl font-black text-green-600">{stats?.deliveryRate ?? 0}%</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingBag className="w-4 h-4 text-red-500" />
              <p className="text-xs text-muted-foreground font-medium">Cancelled</p>
            </div>
            <p className="text-2xl font-black text-red-500">{stats?.cancelled ?? 0}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-foreground">
              {chart === "revenue" ? "Revenue Trend" : "Order Trend"}
            </p>
            <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
              {(["revenue", "orders"] as const).map((c) => (
                <button key={c} onClick={() => setChart(c)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all capitalize ${chart === c ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stats?.chartData ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false}
                interval={period === "7d" ? 0 : period === "30d" ? 4 : 13} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey={chart} stroke="hsl(var(--primary))"
                strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top merchants */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-bold text-foreground">Top Merchants</p>
          </div>
          {(topMerchants ?? []).length === 0
            ? <p className="text-xs text-muted-foreground text-center py-4">No data for this period</p>
            : (topMerchants ?? []).map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <span className="text-xs font-black text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.orders} orders</p>
                </div>
                <p className="text-sm font-bold text-green-600">₹{m.revenue.toLocaleString("en-IN")}</p>
              </div>
            ))
          }
        </div>

        {/* Top products */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">Top Products</p>
          </div>
          {(topProducts ?? []).length === 0
            ? <p className="text-xs text-muted-foreground text-center py-4">No data for this period</p>
            : <ResponsiveContainer width="100%" height={160}>
                <BarChart data={topProducts ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} tickLine={false} axisLine={false}
                    tickFormatter={(v: string) => v.slice(0, 8)} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

      </div>
    </MobileLayout>
  );
}





