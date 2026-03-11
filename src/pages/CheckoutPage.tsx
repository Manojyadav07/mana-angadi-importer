// src/pages/CheckoutPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useVillageFees, calculateBulkFee } from "@/hooks/useVillageFees";
import { useSlotStatus } from "@/hooks/useSlotStatus";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft, Sun, Moon, MapPin, ShoppingBag, AlertCircle,
  IndianRupee, Package, Truck, CheckCircle2, Clock
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, totalWeight, villageId, clearCart } = useCart();
  const slotStatus = useSlotStatus();
  const [selectedSlot, setSelectedSlot] = useState<"morning" | "evening">(slotStatus.slot);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");

  const { data: village, isLoading: villageLoading } = useVillageFees(villageId);

  const deliveryFee = village?.delivery_fee ?? 0;
  const bulkFee     = village ? calculateBulkFee(village.tier, totalWeight) : 0;
  const total       = subtotal + deliveryFee + bulkFee;
  const meetsMinimum = village ? subtotal >= village.minimum_order : true;

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!user)    throw new Error("Not logged in");
      if (!villageId) throw new Error("No village selected");
      if (!village) throw new Error("Village data not loaded");
      if (!meetsMinimum) throw new Error(`Minimum order is ₹${village.minimum_order}`);
      if (items.length === 0) throw new Error("Cart is empty");

      // Commission: 10% of subtotal (simplified — real calc per shop category)
      const commissionAmount = Math.round(subtotal * 0.10 * 100) / 100;

      // 1. Create order
      const { data: order, error: orderError } = await sb
        .from("orders")
        .insert({
          user_id:           user.id,
          village_id:        villageId,
          subtotal:          subtotal,
          delivery_fee:      deliveryFee,
          bulk_fee:          bulkFee,
          commission_amount: commissionAmount,
          total_amount:      total,
          payment_method:    paymentMethod,
          slot:              selectedSlot,
          status:            "placed",
          settlement_status: "pending",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItems = items.map((item) => ({
        order_id:        order.id,
        item_id:         item.id,
        shop_id:         item.shop_id,
        quantity:        item.quantity,
        price_snapshot:  item.price,
        weight_snapshot: item.weight_kg,
      }));

      const { error: itemsError } = await sb.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      return order.id;
    },
    onSuccess: (orderId) => {
      clearCart();
      navigate(`/order-success?id=${orderId}`);
    },
    onError: (e: any) => {
      toast.error(e.message ?? "Order failed");
    },
  });

  if (items.length === 0) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <ShoppingBag className="w-14 h-14 text-muted-foreground mb-4 opacity-30" />
          <p className="text-base font-bold text-foreground mb-1">Cart is empty</p>
          <button onClick={() => navigate("/")} className="mt-4 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl text-sm active:scale-95 transition-transform">
            Browse Shops
          </button>
        </div>
      </MobileLayout>
    );
  }

  if (!villageId) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <MapPin className="w-14 h-14 text-muted-foreground mb-4 opacity-30" />
          <p className="text-base font-bold text-foreground mb-1">Village not set</p>
          <p className="text-sm text-muted-foreground mb-4">Please update your profile with your village to continue</p>
          <button onClick={() => navigate("/profile")} className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl text-sm active:scale-95 transition-transform">
            Go to Profile
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Order</p>
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
        </div>
      </header>

      <div className="px-4 pb-36 space-y-4">
        {/* Slot closed warning */}
        {!slotStatus.isOpen && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-700">Ordering window closed</p>
              <p className="text-xs text-amber-600 mt-0.5">{slotStatus.nextSlotLabel}</p>
            </div>
          </div>
        )}

        {/* Slot selection */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Select Delivery Slot</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { slot: "morning" as const, icon: Sun,  label: "Morning Slot", time: "Dispatch 11:00 AM", window: "6 AM – 10:30 AM" },
              { slot: "evening" as const, icon: Moon, label: "Evening Slot", time: "Dispatch 5:00 PM",  window: "12 PM – 4:30 PM" },
            ]).map(({ slot, icon: Icon, label, time, window }) => (
              <button key={slot} onClick={() => setSelectedSlot(slot)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  selectedSlot === slot ? "border-primary bg-primary/5" : "border-border bg-muted/50"
                }`}>
                <Icon className={`w-5 h-5 mb-1 ${selectedSlot === slot ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-xs font-bold ${selectedSlot === slot ? "text-primary" : "text-foreground"}`}>{label}</p>
                <p className="text-[10px] text-muted-foreground">{time}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{window}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery location */}
        {village && (
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivering to</p>
              <p className="text-sm font-bold text-foreground">{village.name}</p>
              <p className="text-[10px] text-muted-foreground">Tier {village.tier} · Min order ₹{village.minimum_order}</p>
            </div>
          </div>
        )}

        {/* Minimum order warning */}
        {village && !meetsMinimum && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-red-700">
              Minimum order is ₹{village.minimum_order}. Add ₹{(village.minimum_order - subtotal).toFixed(0)} more.
            </p>
          </div>
        )}

        {/* Cart summary */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Order Summary</p>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <p className="text-sm text-foreground flex-1 truncate">{item.name} × {item.quantity}</p>
                <p className="text-sm font-semibold text-foreground ml-2">₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery</span>
              <span className="font-semibold text-foreground">₹{deliveryFee}</span>
            </div>
            {bulkFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Bulk fee ({totalWeight.toFixed(1)}kg)</span>
                <span className="font-semibold text-amber-600">₹{bulkFee}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black border-t border-border pt-2 mt-1">
              <span className="text-foreground">Total</span>
              <span className="text-primary">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { method: "cod" as const, label: "Cash on Delivery", icon: "💵" },
              { method: "upi" as const, label: "UPI",              icon: "📱" },
            ]).map(({ method, label, icon }) => (
              <button key={method} onClick={() => setPaymentMethod(method)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  paymentMethod === method ? "border-primary bg-primary/5" : "border-border bg-muted/50"
                }`}>
                <span className="text-lg">{icon}</span>
                <span className={`text-xs font-semibold ${paymentMethod === method ? "text-primary" : "text-foreground"}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Place order button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <button
          onClick={() => placeOrder.mutate()}
          disabled={placeOrder.isPending || !meetsMinimum || villageLoading || !slotStatus.isOpen}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {placeOrder.isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Place Order · ₹{total.toFixed(2)}
            </>
          )}
        </button>
        {!slotStatus.isOpen && (
          <p className="text-center text-xs text-muted-foreground mt-2">Ordering is currently closed</p>
        )}
      </div>
    </MobileLayout>
  );
}