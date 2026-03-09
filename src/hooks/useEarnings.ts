import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const sb = supabase as any;

export type Period = "daily" | "weekly" | "monthly";

export interface EarningsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCommission: number;
  netEarnings: number;
  avgOrderValue: number;
  pendingSettlement: number;
  periodLabel: string;
}

export interface EarningsDataPoint {
  label: string;
  revenue: number;
  orders: number;
  commission: number;
  net: number;
}

export interface SettlementRecord {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  initiated_at: string;
  completed_at: string | null;
  utr_number: string | null;
  bank_account: string | null;
}

export interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  image_url: string | null;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function periodRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  const from = new Date(now);

  if (period === "daily")        from.setDate(now.getDate() - 30);
  else if (period === "weekly")  from.setDate(now.getDate() - 84);  // 12 weeks
  else                           from.setMonth(now.getMonth() - 12);

  return { from: from.toISOString(), to };
}

function groupByPeriod(
  rows: { created_at: string; total: number; commission: number }[],
  period: Period
): EarningsDataPoint[] {
  const map = new Map<string, { revenue: number; orders: number; commission: number }>();

  rows.forEach((r) => {
    const d = new Date(r.created_at);
    let key: string;

    if (period === "daily") {
      key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    } else if (period === "weekly") {
      const dow = d.getDay() || 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - dow + 1);
      key = monday.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    } else {
      key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    }

    const prev = map.get(key) ?? { revenue: 0, orders: 0, commission: 0 };
    map.set(key, {
      revenue:    prev.revenue    + r.total,
      orders:     prev.orders     + 1,
      commission: prev.commission + r.commission,
    });
  });

  return Array.from(map.entries()).map(([label, v]) => ({
    label,
    revenue:    Math.round(v.revenue),
    orders:     v.orders,
    commission: Math.round(v.commission),
    net:        Math.round(v.revenue - v.commission),
  }));
}

const PERIOD_LABELS: Record<Period, string> = {
  daily:   "Last 30 Days",
  weekly:  "Last 12 Weeks",
  monthly: "Last 12 Months",
};

// ─── hooks ──────────────────────────────────────────────────────────────────

export function useEarningsSummary(period: Period) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["earnings-summary", user?.id, period],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<EarningsSummary> => {
      const { from, to } = periodRange(period);

      const { data: profile } = await sb
        .from("profiles")
        .select("shop_id")
        .eq("id", user!.id)
        .single();

      if (!profile?.shop_id) {
        return {
          totalRevenue: 0, totalOrders: 0, totalCommission: 0,
          netEarnings: 0, avgOrderValue: 0, pendingSettlement: 0,
          periodLabel: PERIOD_LABELS[period],
        };
      }

      const { data: orders, error } = await sb
        .from("orders")
        .select("id, total, commission, status, created_at")
        .eq("shop_id", profile.shop_id)
        .gte("created_at", from)
        .lte("created_at", to)
        .in("status", ["delivered", "completed"]);

      if (error) throw error;

      const rows = orders ?? [];
      const totalRevenue    = rows.reduce((s: number, r: any) => s + (r.total      ?? 0), 0);
      const totalCommission = rows.reduce((s: number, r: any) => s + (r.commission ?? 0), 0);

      const { data: pending } = await sb
        .from("orders")
        .select("total")
        .eq("shop_id", profile.shop_id)
        .eq("status", "delivered")
        .is("settlement_id", null);

      const pendingGross = (pending ?? []).reduce((s: number, r: any) => s + (r.total ?? 0), 0);

      return {
        totalRevenue:      Math.round(totalRevenue),
        totalOrders:       rows.length,
        totalCommission:   Math.round(totalCommission),
        netEarnings:       Math.round(totalRevenue - totalCommission),
        avgOrderValue:     rows.length ? Math.round(totalRevenue / rows.length) : 0,
        pendingSettlement: Math.round(pendingGross * 0.9),
        periodLabel:       PERIOD_LABELS[period],
      };
    },
  });
}

export function useEarningsChart(period: Period) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["earnings-chart", user?.id, period],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<EarningsDataPoint[]> => {
      const { from, to } = periodRange(period);

      const { data: profile } = await sb
        .from("profiles")
        .select("shop_id")
        .eq("id", user!.id)
        .single();

      if (!profile?.shop_id) return [];

      const { data: orders, error } = await sb
        .from("orders")
        .select("total, commission, created_at")
        .eq("shop_id", profile.shop_id)
        .gte("created_at", from)
        .lte("created_at", to)
        .in("status", ["delivered", "completed"])
        .order("created_at");

      if (error) throw error;

      return groupByPeriod(
        (orders ?? []).map((o: any) => ({
          created_at: o.created_at,
          total:      o.total      ?? 0,
          commission: o.commission ?? 0,
        })),
        period
      );
    },
  });
}

export function useSettlementHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["settlement-history", user?.id],
    enabled: !!user?.id,
    staleTime: 120_000,
    queryFn: async (): Promise<SettlementRecord[]> => {
      const { data: profile } = await sb
        .from("profiles")
        .select("shop_id")
        .eq("id", user!.id)
        .single();

      if (!profile?.shop_id) return [];

      const { data, error } = await sb
        .from("settlements")
        .select("*")
        .eq("shop_id", profile.shop_id)
        .order("initiated_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data ?? []) as SettlementRecord[];
    },
  });
}

export function useTopProducts(period: Period) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["top-products", user?.id, period],
    enabled: !!user?.id,
    staleTime: 120_000,
    queryFn: async (): Promise<TopProduct[]> => {
      const { from, to } = periodRange(period);

      const { data: profile } = await sb
        .from("profiles")
        .select("shop_id")
        .eq("id", user!.id)
        .single();

      if (!profile?.shop_id) return [];

      const { data, error } = await sb
        .from("order_items")
        .select(`
          product_id, quantity, price,
          orders!inner(shop_id, created_at, status),
          products(name, image_url)
        `)
        .eq("orders.shop_id", profile.shop_id)
        .gte("orders.created_at", from)
        .lte("orders.created_at", to)
        .in("orders.status", ["delivered", "completed"]);

      if (error) throw error;

      const map = new Map<string, { name: string; image_url: string | null; revenue: number; orders: number }>();

      (data ?? []).forEach((item: any) => {
        const pid = item.product_id;
        const rev = (item.price ?? 0) * (item.quantity ?? 1);
        const prev = map.get(pid) ?? {
          name:      item.products?.name      ?? "Unknown",
          image_url: item.products?.image_url ?? null,
          revenue: 0, orders: 0,
        };
        map.set(pid, { ...prev, revenue: prev.revenue + rev, orders: prev.orders + 1 });
      });

      return Array.from(map.entries())
        .map(([id, v]) => ({ id, ...v, revenue: Math.round(v.revenue) }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
  });
}