import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Tag, Plus, ChevronLeft, Loader2, Trash2, Pencil,
  ToggleLeft, ToggleRight, Percent, IndianRupee, Truck,
  Copy, CheckCircle2, X, Calendar,
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

type CouponType = "percentage" | "flat" | "free_delivery";

const TYPE_CONFIG: Record<CouponType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  percentage:    { label: "% Off",         icon: Percent,     color: "text-blue-600",   bg: "bg-blue-50"   },
  flat:          { label: "Flat Discount", icon: IndianRupee, color: "text-green-600",  bg: "bg-green-50"  },
  free_delivery: { label: "Free Delivery", icon: Truck,       color: "text-orange-600", bg: "bg-orange-50" },
};

interface CouponForm {
  title: string; code: string; type: CouponType;
  value: string; min_order_amount: string;
  max_uses: string; starts_at: string; ends_at: string; is_active: boolean;
}

const EMPTY: CouponForm = {
  title: "", code: "", type: "percentage", value: "",
  min_order_amount: "", max_uses: "", starts_at: "", ends_at: "", is_active: true,
};

function useCoupons() {
  return useQuery({
    queryKey: ["admin-coupons"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("platform_coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function AdminCouponsPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const { data: coupons, isLoading } = useCoupons();

  const [sheetOpen,  setSheetOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form,       setForm]       = useState<CouponForm>(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [copiedId,   setCopiedId]   = useState<string | null>(null);

  useEffect(() => {
    if (editTarget) {
      setForm({
        title:            editTarget.title,
        code:             editTarget.code,
        type:             editTarget.type,
        value:            editTarget.value?.toString() ?? "",
        min_order_amount: editTarget.min_order_amount?.toString() ?? "",
        max_uses:         editTarget.max_uses?.toString() ?? "",
        starts_at:        editTarget.starts_at?.slice(0, 10) ?? "",
        ends_at:          editTarget.ends_at?.slice(0, 10) ?? "",
        is_active:        editTarget.is_active,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editTarget]);

  const set = (k: keyof CouponForm, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const upsert = useMutation({
    mutationFn: async (payload: any) => {
      if (editTarget) {
        const { error } = await sb.from("platform_coupons").update(payload).eq("id", editTarget.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("platform_coupons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("platform_coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  const toggleActive = async (c: any) => {
    try {
      await sb.from("platform_coupons").update({ is_active: !c.is_active }).eq("id", c.id);
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success(c.is_active ? "Deactivated" : "Activated");
    } catch { toast.error("Failed"); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.code.trim()) { toast.error("Title and code are required"); return; }
    setSaving(true);
    try {
      await upsert.mutateAsync({
        title:            form.title.trim(),
        code:             form.code.trim().toUpperCase(),
        type:             form.type,
        value:            form.value ? parseFloat(form.value) : null,
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
        max_uses:         form.max_uses ? parseInt(form.max_uses) : null,
        starts_at:        form.starts_at || null,
        ends_at:          form.ends_at   || null,
        is_active:        form.is_active,
      });
      toast.success(editTarget ? "Coupon updated" : "Coupon created");
      setSheetOpen(false); setEditTarget(null);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleCopy = (c: any) => {
    navigator.clipboard.writeText(c.code);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (c: any) => c.ends_at && new Date(c.ends_at) < new Date();

  return (
    <MobileLayout navType="admin">
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Admin</p>
            <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
          </div>
        </div>
        <button onClick={() => { setEditTarget(null); setSheetOpen(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> New
        </button>
      </header>

      <div className="px-4 pb-28 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2"><div className="h-4 bg-muted rounded animate-pulse w-2/3" /><div className="h-3 bg-muted rounded animate-pulse w-1/2" /></div>
            </div>
          ))
        ) : (coupons ?? []).length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-primary" />
            </div>
            <p className="font-bold text-foreground text-sm">No coupons yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create platform-wide discount codes</p>
          </div>
        ) : (coupons ?? []).map((c: any) => {
          const cfg  = TYPE_CONFIG[c.type as CouponType] ?? TYPE_CONFIG.percentage;
          const Icon = cfg.icon;
          const expired = isExpired(c);
          return (
            <div key={c.id} className={`bg-card border border-border rounded-2xl p-4 shadow-sm ${!c.is_active || expired ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        {c.value && <span className="text-xs font-semibold text-foreground">{c.type === "percentage" ? `${c.value}% off` : `₹${c.value} off`}</span>}
                        {expired && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Expired</span>}
                      </div>
                    </div>
                    <button onClick={() => toggleActive(c)} className="flex-shrink-0 active:scale-90 transition-transform">
                      {c.is_active ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {c.min_order_amount > 0 && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Min ₹{c.min_order_amount}</span>}
                    {c.max_uses && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{c.uses_count}/{c.max_uses} uses</span>}
                    {c.ends_at && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        Until {new Date(c.ends_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5">
                      <Tag className="w-3 h-3 text-primary" />
                      <span className="text-xs font-mono font-bold text-primary tracking-wider">{c.code}</span>
                    </div>
                    <button onClick={() => handleCopy(c)} className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground active:text-primary transition-colors">
                      {copiedId === c.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === c.id ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => { setEditTarget(c); setSheetOpen(true); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={async () => { await deleteCoupon.mutateAsync(c.id); toast.success("Deleted"); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pb-10">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/20" /></div>
            <div className="px-5 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{editTarget ? "Edit Coupon" : "New Coupon"}</h2>
              <button onClick={() => setSheetOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="px-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-2 block">Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(TYPE_CONFIG) as [CouponType, typeof TYPE_CONFIG[CouponType]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={key} onClick={() => set("type", key)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${form.type === key ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-semibold">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {[
                { key: "title", label: "Title *", placeholder: "e.g. Diwali Offer" },
                { key: "code",  label: "Code *",  placeholder: "e.g. DIWALI20" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">{label}</label>
                  <input value={(form as any)[key]}
                    onChange={(e) => set(key as keyof CouponForm, key === "code" ? e.target.value.toUpperCase() : e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {form.type !== "free_delivery" && (
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1.5 block">{form.type === "percentage" ? "Discount %" : "Discount ₹"}</label>
                    <input type="number" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="20" min={0}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Min Order ₹</label>
                  <input type="number" value={form.min_order_amount} onChange={(e) => set("min_order_amount", e.target.value)} placeholder="0" min={0}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Max Uses</label>
                  <input type="number" value={form.max_uses} onChange={(e) => set("max_uses", e.target.value)} placeholder="Unlimited" min={1}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ key: "starts_at", label: "Start Date" }, { key: "ends_at", label: "End Date" }].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground font-medium mb-1.5 block">{label}</label>
                    <input type="date" value={(form as any)[key]} onChange={(e) => set(key as keyof CouponForm, e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground">Customers can apply this code</p>
                </div>
                <button onClick={() => set("is_active", !form.is_active)} className="active:scale-90 transition-transform">
                  {form.is_active ? <ToggleRight className="w-9 h-9 text-green-500" /> : <ToggleLeft className="w-9 h-9 text-muted-foreground" />}
                </button>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-60">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Tag className="w-5 h-5" />}
                {saving ? "Saving..." : "Save Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}





