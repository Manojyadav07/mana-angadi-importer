import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthContext";
import { useMerchantShop } from "@/hooks/useShops";
import {
  useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer, Offer,
} from "@/hooks/useOffers";
import {
  Tag, Plus, ChevronLeft, Loader2, Trash2, Pencil,
  ToggleLeft, ToggleRight, Percent, IndianRupee,
  Gift, Truck, Calendar, Copy, CheckCircle2, X,
} from "lucide-react";
import { toast } from "sonner";

// ─── types ────────────────────────────────────────────────────────────────────

type OfferType = "percentage" | "flat" | "bogo" | "free_delivery";

interface FormState {
  title: string;
  description: string;
  type: OfferType;
  value: string;
  min_order_amount: string;
  code: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  title: "", description: "", type: "percentage",
  value: "", min_order_amount: "", code: "",
  starts_at: "", ends_at: "", is_active: true,
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<OfferType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  percentage:    { label: "% Off",          icon: Percent,     color: "text-blue-600",    bg: "bg-blue-50"   },
  flat:          { label: "Flat Discount",  icon: IndianRupee, color: "text-green-600",   bg: "bg-green-50"  },
  bogo:          { label: "Buy 1 Get 1",    icon: Gift,        color: "text-purple-600",  bg: "bg-purple-50" },
  free_delivery: { label: "Free Delivery",  icon: Truck,       color: "text-orange-600",  bg: "bg-orange-50" },
};

function offerToForm(o: Offer): FormState {
  return {
    title:            o.title,
    description:      o.description ?? "",
    type:             o.type as OfferType,
    value:            o.value?.toString() ?? "",
    min_order_amount: o.min_order_amount?.toString() ?? "",
    code:             o.code ?? "",
    starts_at:        o.starts_at ? o.starts_at.slice(0, 10) : "",
    ends_at:          o.ends_at   ? o.ends_at.slice(0, 10)   : "",
    is_active:        o.is_active,
  };
}

function isExpired(o: Offer) {
  if (!o.ends_at) return false;
  return new Date(o.ends_at) < new Date();
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── offer card ───────────────────────────────────────────────────────────────

function OfferCard({
  offer, shopId,
  onEdit, onDelete, onToggle,
}: {
  offer: Offer; shopId: string;
  onEdit: (o: Offer) => void;
  onDelete: (id: string) => void;
  onToggle: (o: Offer) => void;
}) {
  const cfg     = TYPE_CONFIG[offer.type as OfferType] ?? TYPE_CONFIG.percentage;
  const Icon    = cfg.icon;
  const expired = isExpired(offer);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!offer.code) return;
    navigator.clipboard.writeText(offer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-card border rounded-2xl p-4 shadow-sm transition-opacity ${
      !offer.is_active || expired ? "opacity-60" : ""
    } border-border`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{offer.title}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
                {offer.value && (
                  <span className="text-xs font-semibold text-foreground">
                    {offer.type === "percentage" ? `${offer.value}% off` : `₹${offer.value} off`}
                  </span>
                )}
                {expired && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                    Expired
                  </span>
                )}
              </div>
            </div>

            {/* Toggle */}
            <button onClick={() => onToggle(offer)} className="flex-shrink-0 active:scale-90 transition-transform">
              {offer.is_active
                ? <ToggleRight className="w-8 h-8 text-green-500" />
                : <ToggleLeft  className="w-8 h-8 text-muted-foreground" />
              }
            </button>
          </div>

          {/* Description */}
          {offer.description && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{offer.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            {offer.min_order_amount > 0 && (
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                Min ₹{offer.min_order_amount}
              </span>
            )}
            {offer.starts_at && (
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {formatDate(offer.starts_at)} – {formatDate(offer.ends_at) ?? "∞"}
              </span>
            )}
          </div>

          {/* Promo code */}
          {offer.code && (
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5">
                <Tag className="w-3 h-3 text-primary" />
                <span className="text-xs font-mono font-bold text-primary tracking-wider">{offer.code}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground active:text-primary transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={() => onEdit(offer)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={() => onDelete(offer.id)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── bottom sheet form ────────────────────────────────────────────────────────

function OfferForm({
  open, onClose, onSave, saving, initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (f: FormState) => Promise<void>;
  saving: boolean;
  initial: FormState;
}) {
  const [form, setForm] = useState<FormState>(initial);
  useEffect(() => { setForm(initial); }, [initial]);

  if (!open) return null;

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const needsValue = form.type === "percentage" || form.type === "flat";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pb-10">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="px-5 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {initial.title ? "Edit Offer" : "New Offer"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-2 block">Offer Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(TYPE_CONFIG) as [OfferType, typeof TYPE_CONFIG[OfferType]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => set("type", key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      form.type === key
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-semibold">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Title *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Diwali 20% off"
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional details about this offer..."
              rows={2}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Value + Min order */}
          <div className="grid grid-cols-2 gap-3">
            {needsValue && (
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
                  {form.type === "percentage" ? "Discount %" : "Discount ₹"} *
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => set("value", e.target.value)}
                  placeholder={form.type === "percentage" ? "20" : "50"}
                  min={0}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
            <div className={needsValue ? "" : "col-span-2"}>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Min Order ₹</label>
              <input
                type="number"
                value={form.min_order_amount}
                onChange={(e) => set("min_order_amount", e.target.value)}
                placeholder="0"
                min={0}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Promo code */}
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
              Promo Code <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="e.g. DIWALI20"
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Start Date</label>
              <input
                type="date"
                value={form.starts_at}
                onChange={(e) => set("starts_at", e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">End Date</label>
              <input
                type="date"
                value={form.ends_at}
                onChange={(e) => set("ends_at", e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">Customers can use this offer</p>
            </div>
            <button
              onClick={() => set("is_active", !form.is_active)}
              className="active:scale-90 transition-transform"
            >
              {form.is_active
                ? <ToggleRight className="w-9 h-9 text-green-500" />
                : <ToggleLeft  className="w-9 h-9 text-muted-foreground" />
              }
            </button>
          </div>

          {/* Save */}
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Tag className="w-5 h-5" />}
            {saving ? "Saving..." : "Save Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function MerchantOffersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: shop, isLoading: shopLoading } = useMerchantShop(user?.id);
  const shopId = shop?.id;

  const { data: offers, isLoading: offersLoading } = useOffers(shopId);
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  const [sheetOpen,  setSheetOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Offer | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [filterTab,  setFilterTab]  = useState<"all" | "active" | "expired">("all");

  const isLoading = shopLoading || offersLoading;

  const filtered = (offers ?? []).filter((o) => {
    if (filterTab === "active")  return o.is_active && !isExpired(o);
    if (filterTab === "expired") return !o.is_active || isExpired(o);
    return true;
  });

  const openCreate = () => { setEditTarget(null); setSheetOpen(true); };
  const openEdit   = (o: Offer) => { setEditTarget(o); setSheetOpen(true); };

  const handleSave = async (form: FormState) => {
    if (!shopId) return;
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if ((form.type === "percentage" || form.type === "flat") && !form.value) {
      toast.error("Discount value is required"); return;
    }

    setSaving(true);
    try {
      const payload = {
        shop_id:          shopId,
        title:            form.title.trim(),
        description:      form.description.trim() || null,
        type:             form.type,
        value:            form.value ? parseFloat(form.value) : null,
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
        code:             form.code.trim() || null,
        starts_at:        form.starts_at || null,
        ends_at:          form.ends_at   || null,
        is_active:        form.is_active,
      };

      if (editTarget) {
        await updateOffer.mutateAsync({ id: editTarget.id, updates: payload, shopId });
        toast.success("Offer updated");
      } else {
        await createOffer.mutateAsync(payload);
        toast.success("Offer created");
      }

      setSheetOpen(false);
    } catch {
      toast.error("Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!shopId) return;
    try {
      await deleteOffer.mutateAsync({ id, shopId });
      toast.success("Offer deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggle = async (o: Offer) => {
    if (!shopId) return;
    try {
      await updateOffer.mutateAsync({ id: o.id, updates: { is_active: !o.is_active }, shopId });
      toast.success(o.is_active ? "Offer deactivated" : "Offer activated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const activeCount  = (offers ?? []).filter((o) => o.is_active && !isExpired(o)).length;
  const expiredCount = (offers ?? []).filter((o) => !o.is_active || isExpired(o)).length;

  return (
    <MobileLayout navType="merchant">
      {/* Header */}
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Promotions
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">Offers</h1>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </header>

      <div className="px-4 pb-28 space-y-4">

        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total",   value: (offers ?? []).length, bg: "bg-card",      text: "text-foreground"       },
            { label: "Active",  value: activeCount,           bg: "bg-green-50",  text: "text-green-700"        },
            { label: "Expired", value: expiredCount,          bg: "bg-muted",     text: "text-muted-foreground" },
          ].map((c) => (
            <div key={c.label} className={`${c.bg} border border-border rounded-2xl p-3 text-center shadow-sm`}>
              {isLoading
                ? <div className="h-5 w-8 bg-muted animate-pulse rounded mx-auto" />
                : <p className={`text-xl font-black ${c.text}`}>{c.value}</p>
              }
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {(["all", "active", "expired"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTab(t)}
              className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all duration-200 capitalize ${
                filterTab === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-3">
                <div className="w-11 h-11 bg-muted rounded-xl animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-primary" />
            </div>
            <p className="font-bold text-foreground text-sm">
              {filterTab === "all" ? "No offers yet" : `No ${filterTab} offers`}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-5">
              {filterTab === "all" ? "Create your first offer to attract more customers" : ""}
            </p>
            {filterTab === "all" && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl mx-auto active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                Create Offer
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
                shopId={shopId!}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form sheet */}
      <OfferForm
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
        saving={saving}
        initial={editTarget ? offerToForm(editTarget) : EMPTY_FORM}
      />
    </MobileLayout>
  );
}