import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export function useMerchantDashboard(shopId: string | undefined) {
  return useQuery({
    queryKey: ["merchant-dashboard", shopId],
    enabled: !!shopId,
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: orders, error } = await sb
        .from("orders")
        .select("id, status, total, created_at")
        .eq("shop_id", shopId);

      if (error) throw error;
      const all = orders || [];

      const todays = all.filter((o: any) => o.created_at >= todayStart);
      const weekly = all.filter((o: any) => o.created_at >= weekStart);
      const monthly = all.filter((o: any) => o.created_at >= monthStart);

      const sum = (arr: any[]) =>
        arr.filter((o) => o.status === "delivered").reduce((acc: number, o: any) => acc + (o.total || 0), 0);

      return {
        todayOrders: todays.length,
        pendingOrders: all.filter((o: any) => o.status === "placed").length,
        acceptedOrders: all.filter((o: any) => o.status === "accepted").length,
        readyOrders: all.filter((o: any) => o.status === "ready").length,
        todayEarnings: sum(todays),
        weeklyEarnings: sum(weekly),
        monthlyEarnings: sum(monthly),
        totalDelivered: all.filter((o: any) => o.status === "delivered").length,
        totalCancelled: all.filter((o: any) => o.status === "rejected").length,
        recentOrders: all
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5),
      };
    },
  });
}
