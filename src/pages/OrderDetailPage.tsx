import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  ChevronLeft, Sun, Moon, MapPin, ShoppingBag,
  Package, Truck, CheckCircle2, XCircle, Clock,
} from "lucide-react";

const sb = supabase as any;

// ─── helpers ─────────────────────────────────────────────────────────────────
const SLOT_CONFIG = {
  morning: { label: "Morning Batch", dispatch: "11:00 AM", icon: Sun,  color: "text-amber-500",  bg: "bg-amber-50",  border: "border-amber-200" },
  evening: { label: "Evening Batch", dispatch: "5:00 PM",  icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
} as const;

// Timeline steps — index corresponds to order progression
const TIMELINE = [
  {
    key:    "placed",
    label:  "Order Placed",
    label_te: "ఆర్డర్ ఇవ్వబడింది",
    icon:   Package,
    color:  "text-blue-500",
    active: "bg-blue-500",
  },
  {
    key:    "dispatched",
    label:  "Dispatched",
    label_te: "పంపబడింది",
    icon:   Truck,
    color:  "text-amber-500",
    active: "bg-amber-500",
  },
  {
    key:    "delivered",
    label:  "Delivered",
    label_te: "డెలివరీ అయింది",
    icon:   CheckCircle2,
    color:  "text-green-500",
    active: "bg-green-500",
  },
];

const STATUS_ORDER = ["placed", "dispatched", "delivered"];

function fmt(n: number) {
  return `₹${n.toFixed(2)}`;
}

function fmtWeight(kg: number) {
  if (kg < 1) return `${Math.round(kg * 1000)}g`;
  return `${kg}kg`;
}

// ─── sub-components ───────────────────────────────────────────────────────────
function TimelineStep({
  step,
  reached,
  isCurrent,
  isLast,
}: {
  step: (typeof TIMELINE)[number];
  reached: boolean;
  isCurrent: boolean;
  isLast: boolean;
}) {
  const Icon = step.icon;
  return (
    <div className="flex gap-3">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
            reached
              ? `${step.active} border-transparent`
              : "bg-muted border-border"
          } ${isCurrent ? "ring-4 ring-offset-2 ring-offset-background ring-opacity-30 ring-primary" : ""}`}
        >
          <Icon
            className={`w-4 h-4 ${reached ? "text-white" : "text-muted-foreground"}`}
            strokeWidth={2}
          />
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[28px] mt-1 rounded-full transition-all ${
              reached ? "bg-primary/40" : "bg-border"
            }`}
          />
        )}
      </div>

      {/* Label */}
      <div className="pb-5 pt-1.5 min-w-0">
        <p className={`text-sm font-bold ${reached ? "text-foreground" : "text-muted-foreground"}`}>
          {step.label}
        </p>
        <p className={`text-xs ${reached ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
          {step.label_te}
        </p>
        {isCurrent && (
          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            Current status
          </span>
        )}
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate    = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-detail", orderId],
    enabled:  !!orderId,
    queryFn: async () => {
      const { data, error } = await sb
        .from("orders")
        .select(`
          id, slot, status, subtotal, delivery_fee, bulk_fee,
          total_amount, payment_method, notes, created_at,
          villages ( name ),
          order_items (
            id, quantity, price_snapshot, weight_snapshot,
            items ( name, image_url ),
            shops ( name )
          )
        `)
        .eq("id", orderId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const slot        = order?.slot as keyof typeof SLOT_CONFIG | undefined;
  const slotCfg     = slot ? SLOT_CONFIG[slot] : null;
  const SlotIcon    = slotCfg?.icon ?? Sun;
  const isCancelled = order?.status === "cancelled";
  const statusIdx   = STATUS_ORDER.indexOf(order?.status ?? "");
  const villageName = (order?.villages as any)?.name ?? "—";

  const orderItems = (order?.order_items ?? []) as any[];

  // Group items by shop
  const byShop = orderItems.reduce<Record<string, { shopName: string; items: any[] }>>((acc, oi) => {
    const shopId   = oi.shops?.name ?? "Unknown Shop";
    if (!acc[shopId]) acc[shopId] = { shopName: shopId, items: [] };
    acc[shopId].items.push(oi);
    return acc;
  }, {});

  // ── loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <MobileLayout navType="customer">
        <div className="min-h-screen flex items-center justify-center">
          <div className="space-y-3 w-full px-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout navType="customer">
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
          <XCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-base font-bold text-foreground">Order not found</p>
          <p className="text-sm text-muted-foreground">This order may have been removed or you don't have access.</p>
          <button onClick={() => navigate("/orders")} className="btn-primary mt-2">
            Back to Orders
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout navType="customer">
      <div className="min-h-screen flex flex-col pb-12">

        {/* ── Header ── */}
        <header className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-foreground leading-tight">Order Details</h1>
            <p className="text-xs font-mono text-muted-foreground">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          {isCancelled ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">
              Cancelled
            </span>
          ) : (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
              {order.status}
            </span>
          )}
        </header>

        <div className="px-4 space-y-4">

          {/* ── Slot + village ── */}
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {slotCfg && (
              <div className={`flex items-center gap-3 px-4 py-3 ${slotCfg.bg}`}>
                <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center flex-shrink-0">
                  <SlotIcon className={`w-4 h-4 ${slotCfg.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Slot</p>
                  <p className="text-sm font-bold text-foreground">{slotCfg.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Dispatch</p>
                  <p className="text-sm font-bold text-foreground">{slotCfg.dispatch}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Delivering to</p>
                <p className="text-sm font-bold text-foreground">{villageName}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] text-muted-foreground">Payment</p>
                <p className="text-sm font-bold text-foreground uppercase">{order.payment_method}</p>
              </div>
            </div>
          </div>

          {/* ── Status timeline ── */}
          {!isCancelled && (
            <div className="bg-card border border-border rounded-2xl px-4 py-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">
                Delivery Status
              </p>
              {TIMELINE.map((step, i) => {
                const reached   = statusIdx >= i;
                const isCurrent = statusIdx === i;
                const isLast    = i === TIMELINE.length - 1;
                return (
                  <TimelineStep
                    key={step.key}
                    step={step}
                    reached={reached}
                    isCurrent={isCurrent}
                    isLast={isLast}
                  />
                );
              })}
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700">This order was cancelled</p>
                {order.notes && (
                  <p className="text-xs text-red-600 mt-0.5">{order.notes}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Items by shop ── */}
          {Object.values(byShop).map(({ shopName, items }) => (
            <div key={shopName} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
                <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-bold text-foreground">{shopName}</p>
              </div>
              <div className="divide-y divide-border">
                {items.map((oi: any) => {
                  const item = oi.items as any;
                  return (
                    <div key={oi.id} className="flex items-center gap-3 px-4 py-3">
                      {/* Image */}
                      {item?.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item?.name ?? ""}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      {/* Name + weight */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {item?.name ?? "Item"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            ×{oi.quantity}
                          </span>
                          {oi.weight_snapshot > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {fmtWeight(oi.weight_snapshot * oi.quantity)} total
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-foreground">
                          {fmt(oi.price_snapshot * oi.quantity)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {fmt(oi.price_snapshot)} each
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── Fee breakdown ── */}
          <div className="bg-card border border-border rounded-2xl px-4 py-4 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
              Bill Summary
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Item total</span>
              <span className="font-semibold text-foreground">{fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="font-semibold text-foreground">{fmt(order.delivery_fee)}</span>
            </div>
            {order.bulk_fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bulk handling</span>
                <span className="font-semibold text-foreground">{fmt(order.bulk_fee)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black border-t border-border pt-2 mt-1">
              <span className="text-foreground">Total Paid</span>
              <span className="text-primary">{fmt(order.total_amount)}</span>
            </div>
          </div>

          {/* ── Placed at ── */}
          <div className="flex items-center gap-2 justify-center pb-4">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>

        </div>
      </div>
    </MobileLayout>
  );
}