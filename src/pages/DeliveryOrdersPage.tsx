import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  RefreshCw, Package, MapPin, Sun, Moon,
  CheckCircle2, Truck, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

interface AssignmentStatusCfg {
  label:      string;
  color:      string;
  next?:      string;
  nextLabel?: string;
}

const ASSIGNMENT_STATUS: Record<string, AssignmentStatusCfg> = {
  assigned:  { label: "Assigned",  color: "bg-blue-100 text-blue-700",   next: "picked",    nextLabel: "Mark Picked Up" },
  picked:    { label: "Picked Up", color: "bg-amber-100 text-amber-700", next: "delivered", nextLabel: "Mark Delivered" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
};

function fmt(n: number) { return `₹${n.toFixed(2)}`; }

export function DeliveryOrdersPage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"active" | "delivered">("active");

  const { data: assignments = [], isLoading, refetch } = useQuery({
    queryKey: ["delivery-assignments", user?.id, filter],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      let q = sb
        .from("delivery_assignments")
        .select(`
          id, status, payout_amount, payout_status, assigned_at, notes,
          orders (
            id, slot, total_amount, payment_method, created_at,
            villages ( name ),
            order_items ( id )
          )
        `)
        .eq("delivery_partner_id", user!.id)
        .order("assigned_at", { ascending: false });

      if (filter === "active") {
        q = q.in("status", ["assigned", "picked"]);
      } else {
        q = q.eq("status", "delivered");
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, nextStatus }: { id: string; nextStatus: string }) => {
      const { error } = await sb
        .from("delivery_assignments")
        .update({ status: nextStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-assignments"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const activeCount = assignments.filter((a: any) =>
    ["assigned", "picked"].includes(a.status)
  ).length;

  return (
    <MobileLayout navType="delivery">
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Delivery</p>
          <h1 className="text-2xl font-black text-foreground">
            My Deliveries
            {activeCount > 0 && (
              <span className="ml-2 text-sm font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {activeCount} active
              </span>
            )}
          </h1>
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
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {[
            { key: "active"    as const, label: "Active"    },
            { key: "delivered" as const, label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))
        ) : assignments.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold text-foreground">
              {filter === "active" ? "No active deliveries" : "No completed deliveries"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "active"
                ? "You'll be assigned orders before each dispatch"
                : "Completed deliveries will appear here"}
            </p>
          </div>
        ) : assignments.map((a: any) => {
          const order      = a.orders as any;
          const statusCfg = (ASSIGNMENT_STATUS[a.status] ?? { label: a.status, color: "bg-muted text-muted-foreground" }) as AssignmentStatusCfg;
          const itemCount  = order?.order_items?.length ?? 0;
          const village    = order?.villages?.name ?? "—";
          const hasNext    = !!statusCfg.next;

          return (
            <div key={a.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">

              {/* ── Top row ── */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-black text-foreground font-mono">
                    #{order?.id?.slice(0, 8).toUpperCase() ?? "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Assigned {new Date(a.assigned_at).toLocaleString("en-IN", {
                      day: "2-digit", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>

              {/* ── Slot + village ── */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                  order?.slot === "morning" ? "bg-amber-50" : "bg-indigo-50"
                }`}>
                  {order?.slot === "morning"
                    ? <Sun  className="w-3 h-3 text-amber-500" />
                    : <Moon className="w-3 h-3 text-indigo-500" />
                  }
                  <span className={`text-[10px] font-bold capitalize ${
                    order?.slot === "morning" ? "text-amber-700" : "text-indigo-700"
                  }`}>
                    {order?.slot ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="font-semibold text-foreground">{village}</span>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                    <span className={`font-bold uppercase ${
                      order?.payment_method === "cod" ? "text-orange-600" : "text-purple-600"
                    }`}>
                      {order?.payment_method}
                    </span>
                  </p>
                  {(a.payout_amount ?? 0) > 0 && (
                    <p className="text-xs font-bold text-green-600">
                      Your payout: {fmt(a.payout_amount)}
                    </p>
                  )}
                </div>

                {/* ── Action button — only when next status exists ── */}
                {hasNext && (
                  <button
                    onClick={() =>
                      updateStatus.mutate({ id: a.id, nextStatus: statusCfg.next as string })
                    }
                    disabled={updateStatus.isPending}
                    className={`flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl active:scale-95 transition-all disabled:opacity-50 ${
                      statusCfg.next === "picked"
                        ? "bg-blue-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {updateStatus.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : statusCfg.next === "picked" ? (
                      <><Truck className="w-3.5 h-3.5" /> Picked Up</>
                    ) : (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</>
                    )}
                  </button>
                )}
              </div>

              {a.notes && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                  Note: {a.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}