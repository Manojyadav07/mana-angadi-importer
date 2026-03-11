import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, TrendingUp, Package, IndianRupee, Clock } from "lucide-react";

const sb = supabase as any;

function fmt(n: number) { return `₹${n.toFixed(2)}`; }

export function DeliveryEarningsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["delivery-earnings", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("delivery_assignments")
        .select(`
          id, status, payout_amount, payout_status, assigned_at,
          orders ( slot, villages ( name ) )
        `)
        .eq("delivery_partner_id", user!.id)
        .order("assigned_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const delivered  = assignments.filter((a: any) => a.status === "delivered");
  const totalEarned = delivered.reduce((sum: number, a: any) => sum + (a.payout_amount ?? 0), 0);
  const pending     = delivered.filter((a: any) => a.payout_status === "pending");
  const pendingAmt  = pending.reduce((sum: number, a: any) => sum + (a.payout_amount ?? 0), 0);
  const paidAmt     = totalEarned - pendingAmt;

  // Group by date
  const byDate = delivered.reduce<Record<string, any[]>>((acc, a: any) => {
    const date = new Date(a.assigned_at).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(a);
    return acc;
  }, {});

  return (
    <MobileLayout navType="delivery">
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Delivery</p>
          <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
        </div>
      </header>

      <div className="px-4 pb-28 space-y-4">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total Earned",   value: fmt(totalEarned), icon: TrendingUp,    color: "text-foreground"  },
            { label: "Pending Payout", value: fmt(pendingAmt),  icon: Clock,         color: "text-amber-600"   },
            { label: "Total Trips",    value: delivered.length, icon: Package,       color: "text-primary"     },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-3 text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
              <p className={`text-base font-black ${color}`}>
                {isLoading ? "—" : value}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Settlement info ── */}
        {pendingAmt > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <IndianRupee className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-700">
                {fmt(pendingAmt)} pending settlement
              </p>
              <p className="text-[11px] text-amber-600">
                Admin settles weekly to your UPI account
              </p>
            </div>
          </div>
        )}

        {/* ── History by date ── */}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))
        ) : Object.keys(byDate).length === 0 ? (
          <div className="text-center py-20">
            <IndianRupee className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold text-foreground">No earnings yet</p>
            <p className="text-xs text-muted-foreground mt-1">Completed deliveries will appear here</p>
          </div>
        ) : Object.entries(byDate).map(([date, rows]) => {
          const dayTotal = rows.reduce((s: number, a: any) => s + (a.payout_amount ?? 0), 0);
          return (
            <div key={date} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
                <p className="text-xs font-bold text-foreground">{date}</p>
                <p className="text-xs font-black text-primary">{fmt(dayTotal)}</p>
              </div>
              <div className="divide-y divide-border">
                {rows.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-foreground font-mono">
                        Order delivery
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {(a.orders as any)?.slot} · {(a.orders as any)?.villages?.name ?? "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{fmt(a.payout_amount ?? 0)}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        a.payout_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {a.payout_status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}