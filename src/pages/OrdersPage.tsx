// src/pages/OrdersPage.tsx
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Package, Sun, Moon } from "lucide-react";

const sb = supabase as any;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  placed:     { label: "Order Placed", color: "bg-blue-100 text-blue-700"   },
  dispatched: { label: "Dispatched",   color: "bg-amber-100 text-amber-700" },
  delivered:  { label: "Delivered",    color: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelled",    color: "bg-red-100 text-red-700"     },
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await sb
        .from("orders")
        .select("id, status, slot, total_amount, created_at, villages(name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  return (
    <MobileLayout navType="customer">
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
      </header>

      <div className="px-4 pb-28 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
          ))
        ) : (orders ?? []).length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold text-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1">Your orders will appear here</p>
            <button
              onClick={() => navigate("/home")}
              className="mt-4 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm active:scale-95 transition-transform"
            >
              Start Shopping
            </button>
          </div>
        ) : (orders ?? []).map((o: any) => {
          const status = STATUS_LABELS[o.status] ?? { label: o.status, color: "bg-muted text-muted-foreground" };
          return (
            <button
              key={o.id}
              onClick={() => navigate(`/order/${o.id}`)}
              className="w-full bg-card border border-border rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-foreground font-mono">
                  #{o.id.slice(0, 8).toUpperCase()}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                {o.slot === "morning"
                  ? <Sun  className="w-3.5 h-3.5 text-amber-500" />
                  : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                <p className="text-xs text-muted-foreground capitalize">
                  {o.slot} slot · {(o.villages as any)?.name ?? "—"}
                </p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
                <p className="text-sm font-black text-foreground">₹{o.total_amount}</p>
              </div>
            </button>
          );
        })}
      </div>
    </MobileLayout>
  );
}