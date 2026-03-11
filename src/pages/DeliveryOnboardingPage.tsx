import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  User, Phone, Bike, FileText,
  ChevronRight, CheckCircle2, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

export function DeliveryOnboardingPage() {
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const queryClient  = useQueryClient();

  const [form, setForm] = useState({
    name:         "",
    phone:        "",
    vehicle_type: "bike" as "bike" | "cycle" | "auto",
    vehicle_no:   "",
    upi_vpa:      "",
    notes:        "",
  });
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<typeof form>) =>
    setForm((p) => ({ ...p, ...patch }));

  const VEHICLE_OPTIONS = [
    { value: "bike",  label: "Motorbike",  emoji: "🏍️" },
    { value: "cycle", label: "Bicycle",    emoji: "🚲" },
    { value: "auto",  label: "Auto",       emoji: "🛺" },
  ] as const;

  const handleSubmit = async () => {
    if (!form.name.trim())  { toast.error("Enter your full name"); return; }
    if (!form.phone.replace(/\D/g,"") || form.phone.replace(/\D/g,"").length < 10) {
      toast.error("Enter a valid 10-digit phone number"); return;
    }
    if (!form.vehicle_no.trim()) { toast.error("Enter your vehicle number"); return; }
    if (!user) return;

    setSaving(true);
    try {
      // Create onboarding application
      const { error } = await sb
        .from("onboarding_applications")
        .insert({
          user_id: user.id,
          type:    "delivery",
          status:  "pending",
          data: {
            name:         form.name.trim(),
            phone:        form.phone.trim(),
            vehicle_type: form.vehicle_type,
            vehicle_no:   form.vehicle_no.trim().toUpperCase(),
            upi_vpa:      form.upi_vpa.trim() || null,
            notes:        form.notes.trim()   || null,
          },
        });
      if (error) throw error;

      // Update profile with phone + name
      await sb
        .from("profiles")
        .update({
          display_name: form.name.trim(),
          phone:        form.phone.trim(),
        })
        .eq("id", user.id);

      queryClient.invalidateQueries({ queryKey: ["delivery-application"] });
      toast.success("Application submitted!");
      navigate("/delivery/pending");
    } catch (err: any) {
      toast.error(err.message ?? "Submission failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout navType="delivery">
      <div className="min-h-screen pb-36">

        {/* ── Header ── */}
        <header className="px-4 pt-8 pb-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
            Become a Delivery Partner
          </p>
          <h1 className="text-2xl font-black text-foreground leading-tight">
            Join Mana Angadi 🛵
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Earn by delivering orders to villages in your area
          </p>
        </header>

        <div className="px-4 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Your full name"
                className="input-village pl-9"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "") })}
                placeholder="10-digit mobile number"
                className="input-village pl-9"
              />
            </div>
          </div>

          {/* Vehicle type */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Vehicle Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => set({ vehicle_type: v.value })}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all active:scale-95 ${
                    form.vehicle_type === v.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <span className="text-2xl">{v.emoji}</span>
                  <span className={`text-xs font-bold ${
                    form.vehicle_type === v.value ? "text-primary" : "text-foreground"
                  }`}>
                    {v.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle number */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Vehicle Number *
            </label>
            <div className="relative">
              <Bike className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={form.vehicle_no}
                onChange={(e) => set({ vehicle_no: e.target.value.toUpperCase() })}
                placeholder="e.g. TS09AB1234"
                className="input-village pl-9 uppercase"
              />
            </div>
          </div>

          {/* UPI */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              UPI ID
              <span className="text-muted-foreground font-normal ml-1">(optional — for payouts)</span>
            </label>
            <input
              type="text"
              inputMode="email"
              value={form.upi_vpa}
              onChange={(e) => set({ upi_vpa: e.target.value.trim() })}
              placeholder="yourname@upi"
              className="input-village"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Additional Notes
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                value={form.notes}
                onChange={(e) => set({ notes: e.target.value })}
                placeholder="Any area preference, availability, etc."
                rows={2}
                className="input-village pl-9 pt-2.5 resize-none"
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-foreground">Why deliver with us?</p>
            {[
              { icon: "🕐", text: "Flexible hours — two slots daily, morning & evening" },
              { icon: "💰", text: "Per-delivery payout + weekly settlement" },
              { icon: "🗺️", text: "Fixed routes — same villages every day" },
              { icon: "📦", text: "Batch model — one pickup, multiple drops" },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base">{icon}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Submit Application
            </>
          )}
        </button>
      </div>
    </MobileLayout>
  );
}