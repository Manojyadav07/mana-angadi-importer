import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthContext";
import { useMerchantShop } from "@/hooks/useShops";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Bell, Settings, ShoppingBag, Package, TrendingUp,
  Tag, Warehouse, Store, ChevronRight, Loader2,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import { useUpdateShop } from "@/hooks/useShops";
import { toast } from "sonner";

export function MerchantDashboardPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { data: shop, isLoading, refetch } = useMerchantShop(user?.id);
  const { data: notifications } = useNotifications();
  const updateShop = useUpdateShop();

  const s            = shop as any;
  const unreadCount  = (notifications ?? []).filter((n: any) => !n.is_read).length;

  const handleToggleOpen = async () => {
    if (!s) return;
    try {
      await updateShop.mutateAsync({ id: s.id, updates: { isOpen: !s.isOpen } });
      refetch();
      toast.success(s.isOpen ? "Shop closed" : "Shop opened");
    } catch {
      toast.error("Failed to update shop status");
    }
  };

  // Quick action tiles
  const quickActions = [
    { label: "Orders",     icon: ShoppingBag, path: "/merchant/orders",       color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Products",   icon: Package,     path: "/merchant/products",     color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Earnings",   icon: TrendingUp,  path: "/merchant/earnings",     color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Inventory",  icon: Warehouse,   path: "/merchant/inventory",    color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Offers",     icon: Tag,         path: "/merchant/offers",       color: "text-pink-600",   bg: "bg-pink-50"   },
    { label: "Store",      icon: Store,       path: "/merchant/profile",      color: "text-teal-600",   bg: "bg-teal-50"   },
  ];

  return (
    <MobileLayout navType="merchant">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Merchant
          </p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">
            {isLoading ? (
              <span className="inline-block h-7 w-40 bg-muted animate-pulse rounded-lg" />
            ) : (
              s?.name_en ?? "Dashboard"
            )}
          </h1>
        </div>

        {/* Top-right actions: Settings + Bell */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/merchant/more")}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate("/merchant/notifications")}
            className="relative w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="px-4 pb-28 space-y-5">

        {/* ── Shop Status Card ────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo or placeholder */}
              <div className="w-12 h-12 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                {s?.logo_url ? (
                  <img src={s.logo_url} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {isLoading ? (
                    <span className="inline-block h-4 w-28 bg-muted animate-pulse rounded" />
                  ) : (s?.name_en ?? "Your Store")}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${s?.isOpen ? "bg-green-500" : "bg-red-400"}`} />
                  <span className="text-xs text-muted-foreground font-medium">
                    {s?.isOpen ? "Open — accepting orders" : "Closed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Open/Close toggle */}
            <button onClick={handleToggleOpen} className="active:scale-90 transition-transform">
              {s?.isOpen
                ? <ToggleRight className="w-10 h-10 text-green-500" />
                : <ToggleLeft  className="w-10 h-10 text-muted-foreground" />
              }
            </button>
          </div>
        </div>

        {/* ── Quick Actions Grid ───────────────────────────────────────── */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            Quick Actions
          </p>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.bg}`}>
                    <Icon className={`w-5 h-5 ${a.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Shortcuts ────────────────────────────────────────────────── */}
        <div className="space-y-2">
          {[
            {
              label: "Notifications",
              sub: unreadCount > 0 ? `${unreadCount} unread` : "All caught up",
              icon: Bell,
              path: "/merchant/notifications",
              badge: unreadCount > 0 ? unreadCount : null,
            },
            {
              label: "Offers & Promotions",
              sub: "Manage discounts and promo codes",
              icon: Tag,
              path: "/merchant/offers",
              badge: null,
            },
            {
              label: "Store Settings",
              sub: "Hours, logo, contact info",
              icon: Settings,
              path: "/merchant/profile",
              badge: null,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full bg-card border border-border rounded-2xl px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.badge && (
                    <span className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </MobileLayout>
  );
}