// src/pages/MerchantProductsPage.tsx
import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchantShop } from '@/hooks/useShops';
import { useMerchantProducts, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import {
  Package, Plus, ImageIcon, RefreshCw,
  AlertCircle, Weight, ChevronDown,
} from 'lucide-react';
import { Product, getLocalizedName } from '@/types';
import { Switch } from '@/components/ui/switch';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ProductImageUpload } from '@/components/merchant/ProductImageUpload';
import { toast } from 'sonner';

// ─── Weight presets (kg) ──────────────────────────────────────────────────────
const WEIGHT_PRESETS = [
  { label: '100g',  value: '0.1' },
  { label: '250g',  value: '0.25' },
  { label: '500g',  value: '0.5' },
  { label: '1 kg',  value: '1' },
  { label: '2 kg',  value: '2' },
  { label: '5 kg',  value: '5' },
];

// ─── Bulk fee preview helper ──────────────────────────────────────────────────
function BulkWarningBadge({ weightKg }: { weightKg: number }) {
  if (weightKg <= 0) return null;
  if (weightKg >= 15) {
    return (
      <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
        ⚠️ This item alone triggers bulk fee (≥15 kg)
      </p>
    );
  }
  return (
    <p className="text-[11px] text-muted-foreground mt-1">
      Bulk fee triggers when cart total ≥ 15 kg
    </p>
  );
}

// ─── Weight badge shown on product card ──────────────────────────────────────
function WeightBadge({ weightKg }: { weightKg?: number }) {
  if (!weightKg || weightKg <= 0) return null;
  const label = weightKg < 1
    ? `${Math.round(weightKg * 1000)}g`
    : `${weightKg}kg`;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
      <Weight className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// ─── Form state type ──────────────────────────────────────────────────────────
interface FormData {
  name_te:   string;
  name_en:   string;
  price:     string;
  weight_kg: string;   // ← NEW
  inStock:   boolean;
  isActive:  boolean;
  category:  string;
  image:     string | undefined;
}

const EMPTY_FORM: FormData = {
  name_te:   '',
  name_en:   '',
  price:     '',
  weight_kg: '0.5',   // ← sensible default
  inStock:   true,
  isActive:  true,
  category:  '',
  image:     undefined,
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export function MerchantProductsPage() {
  const { user }         = useAuth();
  const { language, t }  = useLanguage();

  const { data: shop,     isLoading: shopLoading }     = useMerchantShop(user?.id);
  const { data: products = [], isLoading: productsLoading, refetch } =
    useMerchantProducts(shop?.id);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddSheet,   setShowAddSheet]   = useState(false);
  const [formData,       setFormData]       = useState<FormData>(EMPTY_FORM);

  // helpers
  const set = (patch: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const resetForm = () => setFormData(EMPTY_FORM);

  const parsedWeight = parseFloat(formData.weight_kg) || 0;

  // ── Open sheet for editing ────────────────────────────────────────────────
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_te:   product.name_te,
      name_en:   product.name_en,
      price:     product.price.toString(),
      weight_kg: ((product as any).weight_kg ?? 0.5).toString(),  // ← read from DB
      inStock:   product.inStock,
      isActive:  product.isActive,
      category:  (product as any).category ?? '',
      image:     product.image,
    });
    setShowAddSheet(true);
  };

  // ── Open sheet for new product ────────────────────────────────────────────
  const handleAddNew = () => {
    setEditingProduct(null);
    resetForm();
    setShowAddSheet(true);
  };

  // ── Save (create or update) ───────────────────────────────────────────────
  const handleSave = async () => {
    // --- validation ---
    if (!formData.name_te.trim() || !formData.name_en.trim() || !formData.price) {
      toast.error(
        language === 'en'
          ? 'Please fill all required fields'
          : 'దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లను పూరించండి',
      );
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error(
        language === 'en'
          ? 'Please enter a valid price'
          : 'దయచేసి సరైన ధర నమోదు చేయండి',
      );
      return;
    }

    const weightKg = parseFloat(formData.weight_kg);
    if (isNaN(weightKg) || weightKg <= 0) {
      toast.error(
        language === 'en'
          ? 'Please enter a valid weight (must be > 0)'
          : 'దయచేసి సరైన బరువు నమోదు చేయండి',
      );
      return;
    }

    if (!shop) { toast.error('No shop found'); return; }

    // --- common payload ---
    const payload = {
      name_te:   formData.name_te.trim(),
      name_en:   formData.name_en.trim(),
      price,
      weight_kg: weightKg,              // ← included in every save
      inStock:   formData.inStock,
      isActive:  formData.isActive,
      category:  formData.category.trim() || null,
      image:     formData.image,
    } as any;

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, updates: payload });
      } else {
        await createProduct.mutateAsync({ shopId: shop.id, ...payload });
      }

      toast.success(t.productSaved);
      setShowAddSheet(false);
      resetForm();
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(
        language === 'en'
          ? 'Failed to save product'
          : 'ఉత్పత్తి సేవ్ చేయడంలో విఫలమైంది',
      );
    }
  };

  // ── Quick toggles (unchanged) ─────────────────────────────────────────────
  const handleToggleStock = async (productId: string, inStock: boolean) => {
    try { await updateProduct.mutateAsync({ id: productId, updates: { inStock } as any }); }
    catch (err) { console.error('Toggle stock error:', err); }
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try { await updateProduct.mutateAsync({ id: productId, updates: { isActive } as any }); }
    catch (err) { console.error('Toggle active error:', err); }
  };

  const isLoading = shopLoading || productsLoading;
  const isSaving  = createProduct.isPending || updateProduct.isPending;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <MobileLayout navType="merchant">

      {/* ── Header ── */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground animate-fade-in">
          {t.myProducts}
        </h1>
        <p
          className="text-muted-foreground mt-1 text-sm animate-fade-in"
          style={{ animationDelay: '0.05s' }}
        >
          {t.merchantMode}
        </p>
      </header>

      {/* ── States ── */}
      {isLoading ? (
        <div className="px-4 space-y-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>

      ) : !shop ? (
        <div className="px-4">
          <div className="bg-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">
              {language === 'en'
                ? 'No shop found. Please set up your shop first.'
                : 'దుకాణం కనుగొనబడలేదు. దయచేసి మీ దుకాణాన్ని సెటప్ చేయండి.'}
            </p>
          </div>
        </div>

      ) : (
        <div className="px-4 pb-28 animate-fade-in">

          {/* toolbar */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">
              {getLocalizedName(shop, language)}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="p-2 rounded-full bg-muted/50 text-muted-foreground active:scale-90 transition-transform"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                {t.addProduct}
              </button>
            </div>
          </div>

          {/* empty */}
          {products.length === 0 ? (
            <div className="bg-muted/50 rounded-2xl p-10 flex flex-col items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t.noProducts}</p>
              <button
                onClick={handleAddNew}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium active:scale-95 transition-transform"
              >
                {t.addProduct}
              </button>
            </div>

          ) : (
            <div className="space-y-2">
              {products.map((product) => {
                const wKg: number = (product as any).weight_kg ?? 0;
                return (
                  <div
                    key={product.id}
                    className="bg-card rounded-xl border border-border p-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3">

                      {/* thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.image
                          ? <img src={product.image} alt="" className="w-full h-full object-cover" />
                          : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-foreground truncate cursor-pointer"
                          onClick={() => handleEditProduct(product)}
                        >
                          {getLocalizedName(product, language)}
                        </p>

                        {/* price + weight on same row */}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-primary font-semibold text-sm">
                            ₹{product.price}
                          </p>
                          {/* ← weight badge NEW */}
                          <WeightBadge weightKg={wKg} />
                        </div>
                      </div>

                      {/* toggles */}
                      <div className="flex flex-col gap-2 items-end flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{t.inStock}</span>
                          <Switch
                            checked={product.inStock}
                            onCheckedChange={(c) => handleToggleStock(product.id, c)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{t.active}</span>
                          <Switch
                            checked={product.isActive}
                            onCheckedChange={(c) => handleToggleActive(product.id, c)}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Sheet ── */}
      <Sheet open={showAddSheet} onOpenChange={(open) => {
        if (!open) resetForm();
        setShowAddSheet(open);
      }}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle>
              {editingProduct ? t.editProduct : t.addProduct}
            </SheetTitle>
          </SheetHeader>

          <div className="py-3 space-y-4">

            {/* ── Photo ── */}
            {shop && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {language === 'en' ? 'Product Photo' : 'ఉత్పత్తి ఫోటో'}
                </label>
                <ProductImageUpload
                  currentImage={formData.image}
                  shopId={shop.id}
                  onImageUploaded={(url) => set({ image: url })}
                  onImageRemoved={() => set({ image: undefined })}
                />
              </div>
            )}

            {/* ── Telugu name ── */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t.productNameTe} *
              </label>
              <input
                type="text"
                value={formData.name_te}
                onChange={(e) => set({ name_te: e.target.value })}
                className="input-village"
                placeholder="తెలుగులో పేరు"
              />
            </div>

            {/* ── English name ── */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t.productNameEn} *
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => set({ name_en: e.target.value })}
                className="input-village"
                placeholder="Name in English"
              />
            </div>

            {/* ── Price ── */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t.price} (₹) *
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={formData.price}
                onChange={(e) => set({ price: e.target.value })}
                className="input-village"
                placeholder="0"
                min="1"
              />
            </div>

            {/* ── Weight ── NEW FIELD ── */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Weight (kg) *
              </label>

              {/* preset chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {WEIGHT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => set({ weight_kg: preset.value })}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      formData.weight_kg === preset.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* manual input */}
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.05"
                  min="0.01"
                  value={formData.weight_kg}
                  onChange={(e) => set({ weight_kg: e.target.value })}
                  className="input-village pl-9"
                  placeholder="e.g. 0.5"
                />
              </div>

              {/* inline bulk fee hint */}
              <BulkWarningBadge weightKg={parsedWeight} />
            </div>

            {/* ── Category ── */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t.category}
                <span className="text-muted-foreground/60 font-normal ml-1">(optional)</span>
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => set({ category: e.target.value })}
                  className="input-village appearance-none pr-8"
                >
                  <option value="">— select or leave blank —</option>
                  <option value="grocery">Grocery</option>
                  <option value="vegetables">Vegetables & Fruits</option>
                  <option value="meat">Meat & Seafood</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="bakery">Bakery</option>
                  <option value="dairy">Dairy</option>
                  <option value="snacks">Snacks & Beverages</option>
                  <option value="household">Household</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* ── Toggles ── */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-sm text-foreground">{t.inStock}</p>
                <p className="text-[11px] text-muted-foreground">Customers can order this item</p>
              </div>
              <Switch
                checked={formData.inStock}
                onCheckedChange={(c) => set({ inStock: c })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-sm text-foreground">{t.active}</p>
                <p className="text-[11px] text-muted-foreground">Show this item in your shop</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(c) => set({ isActive: c })}
              />
            </div>

            {/* ── Save button ── */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t.saveProduct
              )}
            </button>

          </div>
        </SheetContent>
      </Sheet>

    </MobileLayout>
  );
}