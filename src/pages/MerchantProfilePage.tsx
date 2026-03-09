import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthContext";
import { useMerchantShop, useUpdateShop } from "@/hooks/useShops";
import { supabase } from "@/integrations/supabase/client";
import {
  Store, Phone, MapPin, Clock, Camera, ChevronLeft,
  Save, Loader2, ToggleLeft, ToggleRight, IndianRupee,
  Timer, ShoppingBag, AlertCircle, Wallet,
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WorkingHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

function defaultHours(): WorkingHour[] {
  return DAYS.map((day) => ({
    day, open: "09:00", close: "21:00", closed: day === "Sun",
  }));
}

function parseHours(raw: any): WorkingHour[] {
  if (!raw || !Array.isArray(raw)) return defaultHours();
  return raw as WorkingHour[];
}

const PREP_TIMES = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
];

const MIN_ORDERS = [
  { label: "No minimum", value: 0 },
  { label: "₹50",        value: 50 },
  { label: "₹100",       value: 100 },
  { label: "₹200",       value: 200 },
  { label: "₹500",       value: 500 },
];

// ── small toggle component ────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button onClick={() => onChange(!checked)} className="active:scale-90 transition-transform">
        {checked
          ? <ToggleRight className="w-9 h-9 text-green-500" />
          : <ToggleLeft  className="w-9 h-9 text-muted-foreground" />
        }
      </button>
    </div>
  );
}

export function MerchantProfilePage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { data: shop, isLoading, refetch } = useMerchantShop(user?.id);
  const updateShop  = useUpdateShop();

  const [saving,       setSaving]       = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── form state ────────────────────────────────────────────────────────────
  const [nameEn,           setNameEn]           = useState("");
  const [nameTe,           setNameTe]           = useState("");
  const [phone,            setPhone]            = useState("");
  const [address,          setAddress]          = useState("");
  const [logoUrl,          setLogoUrl]          = useState("");
  const [hours,            setHours]            = useState<WorkingHour[]>(defaultHours());
  // shop status
  const [isOpen,           setIsOpen]           = useState(true);
  const [tempClosure,      setTempClosure]      = useState("");
  // order settings
  const [minOrder,         setMinOrder]         = useState(0);
  const [prepTime,         setPrepTime]         = useState(30);
  const [acceptsCod,       setAcceptsCod]       = useState(true);
  const [acceptsUpi,       setAcceptsUpi]       = useState(true);
  // upi
  const [upiVpa,           setUpiVpa]           = useState("");
  const [upiPayeeName,     setUpiPayeeName]     = useState("");

  // ── hydrate from shop ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!shop) return;
    const s = shop as any;
    setNameEn(s.name_en           ?? "");
    setNameTe(s.name_te           ?? "");
    setPhone(s.phone              ?? "");
    setAddress(s.address          ?? "");
    setLogoUrl(s.logo_url         ?? "");
    setHours(parseHours(s.working_hours));
    setIsOpen(s.isOpen            ?? true);
    setTempClosure(s.tempClosureReason ?? "");
    setMinOrder(s.minOrderAmount  ?? 0);
    setPrepTime(s.prepTimeMinutes ?? 30);
    setAcceptsCod(s.acceptsCod    ?? true);
    setAcceptsUpi(s.acceptsUpi    ?? true);
    setUpiVpa(s.upiVpa            ?? "");
    setUpiPayeeName(s.upiPayeeName ?? "");
  }, [shop]);

  // ── logo upload ───────────────────────────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const s = shop as any;
    if (!file || !s) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2 MB"); return; }

    setUploadingLogo(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `shop-logos/${s.id}.${ext}`;
      const { error: upErr } = await sb.storage.from("shop-logos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: publicUrlData } = sb.storage.from("shop-logos").getPublicUrl(path);
      setLogoUrl(publicUrlData?.publicUrl ?? "");
      toast.success("Logo uploaded");
    } catch { toast.error("Failed to upload logo"); }
    finally  { setUploadingLogo(false); }
  };

  // ── hours ─────────────────────────────────────────────────────────────────
  const updateHour = (idx: number, field: keyof WorkingHour, value: string | boolean) =>
    setHours((prev) => prev.map((h, i) => (i === idx ? { ...h, [field]: value } : h)));

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const s = shop as any;
    if (!s) return;
    if (!nameEn.trim()) { toast.error("Store name is required"); return; }
    if (acceptsUpi && !upiVpa.trim()) { toast.error("UPI ID is required when UPI is enabled"); return; }

    setSaving(true);
    try {
      await updateShop.mutateAsync({
        id: s.id,
        updates: {
          name_en:           nameEn.trim(),
          name_te:           nameTe.trim(),
          phone:             phone.trim(),
          address:           address.trim(),
          logo_url:          logoUrl,
          working_hours:     hours,
          isOpen,
          tempClosureReason: isOpen ? "" : tempClosure,
          minOrderAmount:    minOrder,
          prepTimeMinutes:   prepTime,
          acceptsCod,
          acceptsUpi,
          upiVpa:            upiVpa.trim(),
          upiPayeeName:      upiPayeeName.trim(),
        },
      });
      await refetch();
      toast.success("Store profile saved");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save profile");
    } finally { setSaving(false); }
  };

  if (isLoading) {
    return (
      <MobileLayout navType="merchant">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const s = shop as any;

  return (
    <MobileLayout navType="merchant">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Store Settings</p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">Profile</h1>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </header>

      <div className="px-4 pb-28 space-y-5">

        {/* ── Shop Status ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Shop Status</p>
          </div>

          <Toggle checked={isOpen} onChange={setIsOpen} label={isOpen ? "🟢 Open — accepting orders" : "🔴 Closed — not accepting orders"} />

          {!isOpen && (
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
                Reason for closure (shown to customers)
              </label>
              <input
                value={tempClosure}
                onChange={(e) => setTempClosure(e.target.value)}
                placeholder="e.g. Closed for festival, Back on Monday"
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {!isOpen && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">Customers cannot place new orders while shop is closed.</p>
            </div>
          )}
        </div>

        {/* ── Logo ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-4">Store Logo</p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center">
                {logoUrl
                  ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  : <Store className="w-8 h-8 text-muted-foreground" />
                }
              </div>
              {uploadingLogo && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{s?.name_en ?? "Your Store"}</p>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">JPG or PNG · Max 2 MB</p>
              <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}
                className="flex items-center gap-2 text-xs font-semibold text-primary border border-primary/30 bg-primary/5 px-3 py-2 rounded-xl active:scale-95 transition-transform disabled:opacity-60">
                <Camera className="w-3.5 h-3.5" />
                {logoUrl ? "Change Logo" : "Upload Logo"}
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
          </div>
        </div>

        {/* ── Store Name ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Store Name</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Name (English) *</label>
            <input value={nameEn} onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Sri Rama Kirana Store"
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Name (Telugu)</label>
            <input value={nameTe} onChange={(e) => setNameTe(e.target.value)}
              placeholder="e.g. శ్రీ రామ కిరాణా స్టోర్"
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Contact Number</p>
          </div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210" type="tel" maxLength={15}
            className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {/* ── Address ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Address</p>
          </div>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="Door No., Street, Village, District, PIN" rows={3}
            className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        {/* ── Order Settings ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Order Settings</p>
          </div>

          {/* Min order */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
              <label className="text-xs text-muted-foreground font-medium">Minimum Order Amount</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {MIN_ORDERS.map((o) => (
                <button key={o.value} onClick={() => setMinOrder(o.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    minOrder === o.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prep time */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Timer className="w-3.5 h-3.5 text-muted-foreground" />
              <label className="text-xs text-muted-foreground font-medium">Preparation / Packing Time</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {PREP_TIMES.map((p) => (
                <button key={p.value} onClick={() => setPrepTime(p.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    prepTime === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* COD / UPI toggles */}
          <div className="space-y-3 pt-1">
            <Toggle checked={acceptsCod} onChange={setAcceptsCod} label="Accept Cash on Delivery (COD)" />
            <Toggle checked={acceptsUpi} onChange={setAcceptsUpi} label="Accept UPI Payments" />
          </div>
        </div>

        {/* ── UPI Details ── */}
        {acceptsUpi && (
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">UPI Payment Details</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">UPI ID *</label>
              <input value={upiVpa} onChange={(e) => setUpiVpa(e.target.value)}
                placeholder="yourname@upi"
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Account Holder Name</label>
              <input value={upiPayeeName} onChange={(e) => setUpiPayeeName(e.target.value)}
                placeholder="e.g. Rajesh Kirana Store"
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <IndianRupee className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Customers will scan your UPI QR or pay to this ID. Make sure it's correct.
              </p>
            </div>
          </div>
        )}

        {/* ── Working Hours ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Working Hours</p>
          </div>

          <div className="space-y-3">
            {hours.map((h, idx) => (
              <div key={h.day} className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground w-8 flex-shrink-0">{h.day}</span>
                <button onClick={() => updateHour(idx, "closed", !h.closed)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 transition-colors ${
                    h.closed ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  }`}>
                  {h.closed ? "Closed" : "Open"}
                </button>
                {!h.closed ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={h.open}
                      onChange={(e) => updateHour(idx, "open", e.target.value)}
                      className="flex-1 bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <span className="text-xs text-muted-foreground">–</span>
                    <input type="time" value={h.close}
                      onChange={(e) => updateHour(idx, "close", e.target.value)}
                      className="flex-1 bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ) : (
                  <div className="flex-1 h-8 bg-muted/50 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">Closed this day</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground font-medium mb-2">Quick Presets</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "9 AM – 9 PM Daily",  apply: () => setHours(DAYS.map((day) => ({ day, open: "09:00", close: "21:00", closed: false }))) },
                { label: "Mon–Sat Only",        apply: () => setHours(DAYS.map((day) => ({ day, open: "09:00", close: "21:00", closed: day === "Sun" }))) },
                { label: "8 AM – 10 PM",        apply: () => setHours(DAYS.map((day) => ({ day, open: "08:00", close: "22:00", closed: false }))) },
              ].map((p) => (
                <button key={p.label} onClick={p.apply}
                  className="text-[10px] font-semibold text-primary border border-primary/30 bg-primary/5 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Save Bottom ── */}
        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-60 shadow-sm">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save Profile"}
        </button>

      </div>
    </MobileLayout>
  );
}