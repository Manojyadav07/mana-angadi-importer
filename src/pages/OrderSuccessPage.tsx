import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { CheckCircle2, Sun, Moon, MapPin, ShoppingBag, ChevronRight, Home } from "lucide-react";

const sb = supabase as any;

// ─── helpers ─────────────────────────────────────────────────────────────────
const SLOT_CONFIG = {
  morning: {
    label:        "Morning Batch",
    label_te:     "ఉదయం బ్యాచ్",
    dispatch:     "11:00 AM",
    icon:         Sun,
    iconColor:    "text-amber-500",
    bgColor:      "bg-amber-50",
    borderColor:  "border-amber-200",
  },
  evening: {
    label:        "Evening Batch",
    label_te:     "సాయంత్రం బ్యాచ్",
    dispatch:     "5:00 PM",
    icon:         Moon,
    iconColor:    "text-indigo-500",
    bgColor:      "bg-indigo-50",
    borderColor:  "border-indigo-200",
  },
} as const;

const STATUS_COLORS: Record<string, string> = {
  placed:     "bg-blue-100 text-blue-700",
  dispatched: "bg-amber-100 text-amber-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

function fmt(n: number) {
  return `₹${n.toFixed(2)}`;
}

// ─── main page ────────────────────────────────────────────────────────────────
export function OrderSuccessPage() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const orderId       = params.get("id");

  // If no orderId somehow, bounce home
  useEffect(() => {
    if (!orderId) navigate("/home", { replace: true });
  }, [orderId, navigate]);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-success", orderId],
    enabled:  !!orderId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("orders")
        .select(`
          id, slot, status, subtotal, delivery_fee, bulk_fee,
          total_amount, payment_method, created_at,
          villages ( name ),
          order_items ( id )
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
  const itemCount   = order?.order_items?.length ?? 0;
  const villageName = (order?.villages as any)?.name ?? "—";

  // ── loading ──────────────────────────────────────────────────────────────
  if (isLoading || !order) {
    return (
      <MobileLayout navType="customer">
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-40 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-56 rounded-full bg-muted animate-pulse" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout navType="customer">
      <div className="min-h-screen flex flex-col pb-32">

        {/* ── Hero ── */}
        <div className="flex flex-col items-center justify-center px-6 pt-14 pb-8 text-center">
          {/* Animated tick */}
          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.5} />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
          </div>

          <h1 className="text-2xl font-black text-foreground mb-1">Order Placed!</h1>
          <p className="text-sm text-muted-foreground mb-3">
            Your order is confirmed and will be dispatched today.
          </p>

          {/* Order ID chip */}
          <div className="bg-muted px-3 py-1 rounded-full">
            <p className="text-xs font-mono text-muted-foreground">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="px-4 space-y-3">

          {/* ── Slot dispatch card ── */}
          {slotCfg && (
            <div className={`rounded-2xl border-2 ${slotCfg.borderColor} ${slotCfg.bgColor} px-4 py-4`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <SlotIcon className={`w-5 h-5 ${slotCfg.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Your Slot
                  </p>
                  <p className="text-base font-black text-foreground">
                    {slotCfg.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {slotCfg.label_te}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">Dispatch</p>
                  <p className="text-lg font-black text-foreground">{slotCfg.dispatch}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Order summary card ── */}
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {/* Village */}
            <div className="flex items-center gap-3 px-4 py-3">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Delivering to</p>
                <p className="text-sm font-bold text-foreground">{villageName}</p>
              </div>
            </div>

            {/* Items + payment */}
            <div className="flex items-center gap-3 px-4 py-3">
              <ShoppingBag className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Items</p>
                <p className="text-sm font-bold text-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Payment</p>
                <p className="text-sm font-bold text-foreground uppercase">
                  {order.payment_method}
                </p>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{fmt(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="font-semibold text-foreground">{fmt(order.delivery_fee)}</span>
              </div>
              {order.bulk_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bulk handling fee</span>
                  <span className="font-semibold text-foreground">{fmt(order.bulk_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black border-t border-border pt-1.5 mt-1.5">
                <span className="text-foreground">Total</span>
                <span className="text-primary text-base">{fmt(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* ── Status badge ── */}
          <div className="flex justify-center">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* ── What to expect ── */}
          <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-foreground mb-2">What happens next?</p>
            {[
              { icon: "📦", text: `Merchants prepare your order before ${slotCfg?.dispatch ?? "dispatch time"}` },
              { icon: "🚚", text: `Delivery partner picks up and rides to ${villageName}` },
              { icon: "🔔", text: "You'll be notified when your order is out for delivery" },
              { icon: "💵", text: order.payment_method === "cod" ? "Keep cash ready for payment on delivery" : "UPI payment collected on delivery" },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base leading-tight">{icon}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

        </div>

        {/* ── Sticky CTAs ── */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent space-y-2">
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all"
          >
            Track Order
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/home")}
            className="w-full flex items-center justify-center gap-2 bg-muted text-foreground font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>

      </div>
    </MobileLayout>
  );
}