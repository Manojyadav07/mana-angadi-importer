import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  User, Phone, Bike, IndianRupee,
  Save, Loader2, LogOut, ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

export function DeliveryProfilePage() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [saving, setSaving] = useState(false);

  const { data: application } = useQuery({
    queryKey: ["delivery-profile-app", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await sb
        .from("onboarding_applications")
        .select("data, status, created_at")
        .eq("user_id", user!.id)
        .eq("type", "delivery")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
  });

  const appData = (application?.data as any) ?? {};

  const [form, setForm] = useState({
    name:       "",
    phone:      "",
    vehicle_no: "",
    upi_vpa:    "",
  });

  useEffect(() => {
    if (appData.name) {
      setForm({
        name:       appData.name       ?? "",
        phone:      appData.phone      ?? "",
        vehicle_no: appData.vehicle_no ?? "",
        upi_vpa:    appData.upi_vpa    ?? "",
      });
    }
  }, [application]);

  const set = (patch: Partial<typeof form>) =>
    setForm((p) => ({ ...p, ...patch }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await sb
        .from("profiles")
        .update({
          display_name: form.name.trim(),
          phone:        form.phone.trim(),
        })
        .eq("id", user.id);

      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await sb.auth.signOut();
    navigate("/login");
  };

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
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        </div>
      </header>

      <div className="px-4 pb-36 space-y-5">

        {/* ── Avatar block ── */}
        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <User className="w-9 h-9 text-primary" />
          </div>
          <p className="text-base font-black text-foreground">{form.name || "Delivery Partner"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <span className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            application?.status === "approved"
              ? "bg-green-100 text-green-700"
              : application?.status === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {application?.status === "approved" ? "Active Partner"
              : application?.status === "rejected" ? "Application Rejected"
              : "Pending Approval"}
          </span>
        </div>

        {/* ── Editable fields ── */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              className="input-village pl-9"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "") })}
              maxLength={10}
              className="input-village pl-9"
            />
          </div>
        </div>

        {/* ── Read-only from application ── */}
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <Bike className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Vehicle</p>
              <p className="text-sm font-bold text-foreground">
                {appData.vehicle_no ?? "—"} · <span className="capitalize">{appData.vehicle_type ?? "—"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <IndianRupee className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">UPI ID</p>
              <p className="text-sm font-bold text-foreground">{appData.upi_vpa ?? "Not set"}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          To update vehicle or UPI details, contact admin support.
        </p>

        {/* ── Sign out ── */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 font-bold py-3 rounded-2xl text-sm active:scale-95 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* ── Save CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
        </button>
      </div>
    </MobileLayout>
  );
}