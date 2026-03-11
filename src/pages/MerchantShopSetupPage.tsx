// src/pages/MerchantShopSetupPage.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Store, Phone, FileText, MapPin, ChevronDown,
  Camera, Loader2, CheckCircle2, AlertCircle,
  ChevronRight, ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

const sb = supabase as any;

// ─── Business categories ──────────────────────────────────────────────────────
// These values must match the commission-rate logic in calculate_order_fees()
const CATEGORIES = [
  { value: 'grocery',    label: 'Grocery',             label_te: 'కిరాణా',         emoji: '🛒' },
  { value: 'vegetables', label: 'Vegetables & Fruits', label_te: 'కూరగాయలు',       emoji: '🥦' },
  { value: 'meat',       label: 'Meat & Seafood',      label_te: 'మాంసం & చేపలు',  emoji: '🍖' },
  { value: 'pharmacy',   label: 'Pharmacy',             label_te: 'మెడికల్',         emoji: '💊' },
  { value: 'bakery',     label: 'Bakery',               label_te: 'బేకరీ',           emoji: '🍞' },
  { value: 'dairy',      label: 'Dairy & Eggs',         label_te: 'పాల ఉత్పత్తులు', emoji: '🥛' },
  { value: 'general',    label: 'General Store',        label_te: 'జనరల్ స్టోర్',   emoji: '🏪' },
] as const;

type Category = (typeof CATEGORIES)[number]['value'];

// ─── Step type ────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

// ─── Form state ───────────────────────────────────────────────────────────────
interface FormState {
  // Step 1 — Identity
  name_en:     string;
  name_te:     string;
  category:    Category | '';
  town_id:     string;
  // Step 2 — Contact & Description
  phone:       string;
  description: string;
  // Step 3 — UPI (optional)
  upi_vpa:        string;
  upi_payee_name: string;
  logo_url:       string | null;
}

const EMPTY: FormState = {
  name_en:        '',
  name_te:        '',
  category:       '',
  town_id:        '',
  phone:          '',
  description:    '',
  upi_vpa:        '',
  upi_payee_name: '',
  logo_url:       null,
};

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            i < current ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Category card ────────────────────────────────────────────────────────────
function CategoryCard({
  cat, selected, onSelect,
}: {
  cat: (typeof CATEGORIES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card'
      }`}
    >
      <span className="text-2xl">{cat.emoji}</span>
      <span className={`text-[11px] font-bold text-center leading-tight ${
        selected ? 'text-primary' : 'text-foreground'
      }`}>
        {cat.label}
      </span>
      <span className={`text-[10px] text-center leading-tight ${
        selected ? 'text-primary/70' : 'text-muted-foreground'
      }`}>
        {cat.label_te}
      </span>
    </button>
  );
}

// ─── Logo upload ──────────────────────────────────────────────────────────────
function LogoUploader({
  userId,
  currentUrl,
  onUploaded,
}: {
  userId: string;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB');
      return;
    }

    setUploading(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `shop-logos/${userId}/${Date.now()}.${ext}`;

      const { error: upErr } = await sb.storage
        .from('shop-assets')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = sb.storage
        .from('shop-assets')
        .getPublicUrl(path);

      onUploaded(urlData.publicUrl);
      toast.success('Logo uploaded');
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Shop logo"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Store className="w-8 h-8" />
            <span className="text-[10px] font-semibold">Add Logo</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow">
          <Camera className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      </button>
      <p className="text-[11px] text-muted-foreground">
        Optional · Square image, max 2 MB
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function MerchantShopSetupPage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [step,     setStep]     = useState<Step>(1);
  const [form,     setForm]     = useState<FormState>(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const set = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  // ── Load towns ──────────────────────────────────────────────────────────────
  const { data: towns = [], isLoading: townsLoading } = useQuery({
    queryKey: ['towns'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await sb
        .from('towns')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const selectedCat   = CATEGORIES.find((c) => c.value === form.category);
  const selectedTown  = towns.find((t) => t.id === form.town_id);

  // ── Step validation ─────────────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!form.name_en.trim()) {
      toast.error('Please enter your shop name in English');
      return false;
    }
    if (!form.name_te.trim()) {
      toast.error('దయచేసి తెలుగులో దుకాణం పేరు నమోదు చేయండి');
      return false;
    }
    if (!form.category) {
      toast.error('Please select a business category');
      return false;
    }
    if (!form.town_id) {
      toast.error('Please select your town');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const digits = form.phone.replace(/\D/g, '');
    if (!digits || digits.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, 3) as Step);
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    if (!user) { toast.error('Not authenticated'); return; }

    setSaving(true);
    try {
      const { data, error } = await sb
        .from('shops')
        .insert({
          owner_id:       user.id,
          town_id:        form.town_id,         // ← links to towns table
          category:       form.category,         // ← drives commission rate
          name:           form.name_en.trim(),   // ← primary name (schema field)
          name_en:        form.name_en.trim(),
          name_te:        form.name_te.trim(),
          phone:          form.phone.trim(),
          description:    form.description.trim() || null,
          logo_url:       form.logo_url,
          upi_vpa:        form.upi_vpa.trim()        || null,
          upi_payee_name: form.upi_payee_name.trim() || null,
          is_approved:    false,                 // ← admin must approve
          is_active:      true,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Invalidate so merchant dashboard picks up new shop
      queryClient.invalidateQueries({ queryKey: ['merchant-shop'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });

      toast.success('Shop created! Waiting for admin approval.');
      navigate('/merchant/pending');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create shop');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <MobileLayout navType="merchant">

      {/* ── Header ── */}
      <header className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-1">
          {step > 1 && (
            <button
              onClick={goBack}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Step {step} of 3
            </p>
            <h1 className="text-2xl font-black text-foreground leading-tight">
              {step === 1 && 'Shop Details'}
              {step === 2 && 'Contact Info'}
              {step === 3 && 'Payment Setup'}
            </h1>
          </div>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <StepBar current={step} total={3} />

      {/* ── Approval notice ── */}
      <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 font-medium leading-relaxed">
          Your shop will be reviewed by admin before going live. This usually takes a few hours.
        </p>
      </div>

      <div className="px-4 pb-40 space-y-5">

        {/* ══════════════ STEP 1 — Shop Identity ══════════════ */}
        {step === 1 && (
          <>
            {/* Logo */}
            <div className="flex justify-center pt-2">
              {user && (
                <LogoUploader
                  userId={user.id}
                  currentUrl={form.logo_url}
                  onUploaded={(url) => set({ logo_url: url })}
                />
              )}
            </div>

            {/* Shop name — English */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Shop Name (English) *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.name_en}
                  onChange={(e) => set({ name_en: e.target.value })}
                  placeholder="e.g. Raju General Store"
                  className="input-village pl-9"
                />
              </div>
            </div>

            {/* Shop name — Telugu */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                దుకాణం పేరు (తెలుగు) *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.name_te}
                  onChange={(e) => set({ name_te: e.target.value })}
                  placeholder="ఉదా. రాజు జనరల్ స్టోర్"
                  className="input-village pl-9"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Business Category *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.value}
                    cat={cat}
                    selected={form.category === cat.value}
                    onSelect={() => set({ category: cat.value })}
                  />
                ))}
              </div>
            </div>

            {/* Town */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Your Town *
              </label>
              <p className="text-[11px] text-muted-foreground mb-2">
                Your shop will serve customers from villages in this town
              </p>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={form.town_id}
                  onChange={(e) => set({ town_id: e.target.value })}
                  disabled={townsLoading}
                  className="input-village pl-9 pr-8 appearance-none"
                >
                  <option value="">
                    {townsLoading ? 'Loading towns…' : 'Select your town'}
                  </option>
                  {towns.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {selectedTown && (
                <div className="mt-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-teal-700">
                    Shop will be listed in {selectedTown.name}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════ STEP 2 — Contact & Description ══════════════ */}
        {step === 2 && (
          <>
            {/* Summary card */}
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {form.name_en}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {form.name_te}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {selectedCat && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {selectedCat.emoji} {selectedCat.label}
                    </span>
                  )}
                  {selectedTown && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      📍 {selectedTown.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-primary font-semibold flex-shrink-0"
              >
                Edit
              </button>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Shop Phone Number *
              </label>
              <p className="text-[11px] text-muted-foreground mb-2">
                Customers and admin will use this to contact you
              </p>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit mobile number"
                  className="input-village pl-9"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Shop Description
                <span className="text-muted-foreground font-normal ml-1">(optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="Tell customers what you sell, your specialty, freshness guarantee…"
                  rows={3}
                  maxLength={300}
                  className="input-village pl-9 pt-2.5 resize-none"
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-right mt-1">
                {form.description.length}/300
              </p>
            </div>
          </>
        )}

        {/* ══════════════ STEP 3 — UPI / Review ══════════════ */}
        {step === 3 && (
          <>
            {/* Full review summary */}
            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
              <div className="px-4 py-3 flex items-center gap-3">
                {form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Store className="w-7 h-7 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-base font-black text-foreground">{form.name_en}</p>
                  <p className="text-sm text-muted-foreground">{form.name_te}</p>
                </div>
              </div>
              <div className="px-4 py-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Category</p>
                  <p className="font-semibold text-foreground">
                    {selectedCat ? `${selectedCat.emoji} ${selectedCat.label}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Town</p>
                  <p className="font-semibold text-foreground">{selectedTown?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Phone</p>
                  <p className="font-semibold text-foreground">{form.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
                  <p className="font-semibold text-amber-600">Pending Approval</p>
                </div>
              </div>
              {form.description ? (
                <div className="px-4 py-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{form.description}</p>
                </div>
              ) : null}
            </div>

            {/* UPI section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-foreground">UPI Details</p>
                  <p className="text-[11px] text-muted-foreground">
                    Optional — used for settlement payouts
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Optional
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    UPI ID (VPA)
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
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    UPI Payee Name
                  </label>
                  <input
                    type="text"
                    value={form.upi_payee_name}
                    onChange={(e) => set({ upi_payee_name: e.target.value })}
                    placeholder="Name as it appears on UPI"
                    className="input-village"
                  />
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-foreground">What happens next?</p>
              {[
                { icon: '📋', text: 'Admin reviews your shop details' },
                { icon: '✅', text: 'You get notified when approved' },
                { icon: '🛍️', text: 'Add products and start receiving orders' },
                { icon: '💰', text: 'Weekly settlements to your UPI' },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        {step < 3 ? (
          <button
            onClick={goNext}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Submit for Approval
              </>
            )}
          </button>
        )}
      </div>

    </MobileLayout>
  );
}