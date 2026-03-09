import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  useInventory,
  useUpdateStock,
  useToggleAvailability,
  useBulkUpdateStock,
  useMerchantShopId,
  InventoryProduct,
} from "@/hooks/useInventory";
import {
  Package, AlertTriangle, Search, ChevronLeft,
  Loader2, ToggleLeft, ToggleRight, Minus, Plus,
  CheckSquare, Square, Save, Filter, RefreshCw,
  TrendingDown, Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";

// ─── types ───────────────────────────────────────────────────────────────────

type FilterTab = "all" | "low_stock" | "out_of_stock" | "hidden";

// ─── small components ─────────────────────────────────────────────────────────

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0)
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
        Out of Stock
      </span>
    );
  if (stock <= threshold)
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
        Low Stock
      </span>
    );
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
      In Stock
    </span>
  );
}

function StockStepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value === 0}
        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
      >
        <Minus className="w-3 h-3 text-foreground" />
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!isNaN(n) && n >= 0) onChange(n);
        }}
        disabled={disabled}
        className="w-12 text-center text-sm font-bold text-foreground bg-muted border border-border rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40"
      />
      <button
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
      >
        <Plus className="w-3 h-3 text-foreground" />
      </button>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function MerchantInventoryPage() {
  const navigate = useNavigate();
  const { data: shopId, isLoading: shopLoading } = useMerchantShopId();
  const { data: products, isLoading: productsLoading, refetch } = useInventory(shopId ?? undefined);

  const updateStock       = useUpdateStock();
  const toggleAvailability = useToggleAvailability();
  const bulkUpdate        = useBulkUpdateStock();

  // ── local draft state for inline edits ───────────────────────────────────
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStock, setBulkStock] = useState(0);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const isLoading = shopLoading || productsLoading;

  // ── derived lists ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!products) return [];
    let list = products;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name_en.toLowerCase().includes(q));
    }

    if (filterTab === "low_stock")
      list = list.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold);
    else if (filterTab === "out_of_stock")
      list = list.filter((p) => p.stock === 0);
    else if (filterTab === "hidden")
      list = list.filter((p) => !p.is_available);

    return list;
  }, [products, search, filterTab]);

  const summary = useMemo(() => {
    if (!products) return { total: 0, low: 0, out: 0, hidden: 0 };
    return {
      total:  products.length,
      low:    products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold).length,
      out:    products.filter((p) => p.stock === 0).length,
      hidden: products.filter((p) => !p.is_available).length,
    };
  }, [products]);

  // ── handlers ──────────────────────────────────────────────────────────────

  const getDraft = (p: InventoryProduct) =>
    drafts[p.id] !== undefined ? drafts[p.id] : p.stock;

  const setDraft = (id: string, v: number) =>
    setDrafts((prev) => ({ ...prev, [id]: v }));

  const handleSaveOne = async (p: InventoryProduct) => {
    if (!shopId) return;
    const newStock = getDraft(p);
    if (newStock === p.stock) return;
    setSavingId(p.id);
    try {
      await updateStock.mutateAsync({ productId: p.id, stock: newStock, shopId });
      setDrafts((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
      toast.success(`${p.name_en} stock updated to ${newStock}`);
    } catch {
      toast.error("Failed to update stock");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggle = async (p: InventoryProduct) => {
    if (!shopId) return;
    try {
      await toggleAvailability.mutateAsync({
        productId: p.id,
        is_available: !p.is_available,
        shopId,
      });
      toast.success(`${p.name_en} ${!p.is_available ? "visible" : "hidden"}`);
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const handleBulkSave = async () => {
    if (!shopId || selected.size === 0) return;
    try {
      const updates = Array.from(selected).map((id) => ({ id, stock: bulkStock }));
      await bulkUpdate.mutateAsync({ updates, shopId });
      setSelected(new Set());
      setBulkMode(false);
      toast.success(`Updated ${updates.length} products to stock ${bulkStock}`);
    } catch {
      toast.error("Bulk update failed");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const tabs: { key: FilterTab; label: string; count: number; color: string }[] = [
    { key: "all",           label: "All",       count: summary.total,  color: "text-foreground"       },
    { key: "low_stock",     label: "Low",       count: summary.low,    color: "text-amber-600"        },
    { key: "out_of_stock",  label: "Out",       count: summary.out,    color: "text-red-600"          },
    { key: "hidden",        label: "Hidden",    count: summary.hidden, color: "text-muted-foreground" },
  ];

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
              Stock Control
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">Inventory</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setBulkMode((v) => !v); setSelected(new Set()); }}
            className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
              bulkMode
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            Bulk
          </button>
          <button
            onClick={() => refetch()}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-4 pb-28 space-y-4">

        {/* ── Summary Chips ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total",   value: summary.total,  bg: "bg-card",       text: "text-foreground"  },
            { label: "Low",     value: summary.low,    bg: "bg-amber-50",   text: "text-amber-700"   },
            { label: "Out",     value: summary.out,    bg: "bg-red-50",     text: "text-red-700"     },
            { label: "Hidden",  value: summary.hidden, bg: "bg-muted",      text: "text-muted-foreground" },
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

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterTab(t.key)}
              className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all duration-200 ${
                filterTab === t.key
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1 ${filterTab === t.key ? "text-primary" : t.color}`}>
                  ({t.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Bulk Mode Bar ── */}
        {bulkMode && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={selectAll}
                className="flex items-center gap-2 text-xs font-semibold text-primary"
              >
                {selected.size === filtered.length
                  ? <CheckSquare className="w-4 h-4" />
                  : <Square className="w-4 h-4" />
                }
                {selected.size === filtered.length ? "Deselect All" : "Select All"}
              </button>
              <span className="text-xs text-muted-foreground">
                {selected.size} selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground mb-1">Set stock for selected</p>
                <StockStepper value={bulkStock} onChange={setBulkStock} />
              </div>
              <button
                onClick={handleBulkSave}
                disabled={selected.size === 0 || bulkUpdate.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
              >
                {bulkUpdate.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />
                }
                Apply
              </button>
            </div>
          </div>
        )}

        {/* ── Low Stock Alert Banner ── */}
        {summary.low > 0 && filterTab === "all" && !search && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-800">
                {summary.low} product{summary.low > 1 ? "s" : ""} running low
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Restock soon to avoid missing orders
              </p>
            </div>
            <button
              onClick={() => setFilterTab("low_stock")}
              className="text-[10px] font-bold text-amber-700 border border-amber-300 bg-white px-2 py-1 rounded-lg"
            >
              View
            </button>
          </div>
        )}

        {/* ── Product List ── */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-3">
                <div className="w-14 h-14 bg-muted rounded-xl animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-8 bg-muted rounded-lg animate-pulse w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">No products found</p>
            <p className="text-xs mt-1">
              {search ? "Try a different search" : "No products match this filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const draft    = getDraft(p);
              const isDirty  = draft !== p.stock;
              const isSaving = savingId === p.id;

              return (
                <div
                  key={p.id}
                  className={`bg-card border rounded-2xl p-4 shadow-sm transition-all ${
                    bulkMode && selected.has(p.id)
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  } ${!p.is_available ? "opacity-60" : ""}`}
                >
                  <div className="flex gap-3">
                    {/* Checkbox (bulk mode) */}
                    {bulkMode && (
                      <button
                        onClick={() => toggleSelect(p.id)}
                        className="flex-shrink-0 mt-1"
                      >
                        {selected.has(p.id)
                          ? <CheckSquare className="w-5 h-5 text-primary" />
                          : <Square className="w-5 h-5 text-muted-foreground" />
                        }
                      </button>
                    )}

                    {/* Image */}
                    <div className="w-14 h-14 rounded-xl bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name_en} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {p.name_en}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ₹{p.price}
                            {p.unit ? ` / ${p.unit}` : ""}
                            {p.category ? ` · ${p.category}` : ""}
                          </p>
                        </div>
                        {/* Availability toggle */}
                        <button
                          onClick={() => handleToggle(p)}
                          className="flex-shrink-0 active:scale-90 transition-transform"
                        >
                          {p.is_available
                            ? <ToggleRight className="w-8 h-8 text-green-500" />
                            : <ToggleLeft  className="w-8 h-8 text-muted-foreground" />
                          }
                        </button>
                      </div>

                      {/* Stock badge + stepper row */}
                      <div className="flex items-center justify-between mt-2.5 gap-2">
                        <StockBadge stock={p.stock} threshold={p.low_stock_threshold} />

                        {!bulkMode && (
                          <div className="flex items-center gap-2">
                            <StockStepper
                              value={draft}
                              onChange={(v) => setDraft(p.id, v)}
                              disabled={isSaving}
                            />
                            {isDirty && (
                              <button
                                onClick={() => handleSaveOne(p)}
                                disabled={isSaving}
                                className="flex items-center gap-1 text-[11px] font-bold text-primary-foreground bg-primary px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform disabled:opacity-60"
                              >
                                {isSaving
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <Save className="w-3 h-3" />
                                }
                                Save
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Hidden indicator */}
                      {!p.is_available && (
                        <div className="flex items-center gap-1 mt-2">
                          <EyeOff className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            Hidden from customers
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </MobileLayout>
  );
}