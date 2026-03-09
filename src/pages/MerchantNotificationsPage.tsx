import { useState, useMemo } from "react";
import type { ElementType } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
  useClearAllNotifications,
  MerchantNotification,
} from "@/hooks/useNotifications";
import {
  ShoppingBag, XCircle, CheckCircle2,
  IndianRupee, Settings, Tag, AlertTriangle,
  ChevronLeft, CheckCheck, Trash2, Loader2,
  BellOff, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── config ───────────────────────────────────────────────────────────────────

type FilterTab = "all" | "unread" | "orders" | "system";

interface NotifTypeConfig {
  icon: ElementType;
  bg: string;
  iconColor: string;
  label: string;
}

const TYPE_CONFIG: Record<MerchantNotification["type"], NotifTypeConfig> = {
  new_order:       { icon: ShoppingBag,   bg: "bg-blue-50",    iconColor: "text-blue-600",    label: "New Order"   },
  order_cancelled: { icon: XCircle,       bg: "bg-red-50",     iconColor: "text-red-500",     label: "Cancelled"   },
  order_ready:     { icon: CheckCircle2,  bg: "bg-green-50",   iconColor: "text-green-600",   label: "Order Ready" },
  payment:         { icon: IndianRupee,   bg: "bg-emerald-50", iconColor: "text-emerald-600", label: "Payment"     },
  system:          { icon: Settings,      bg: "bg-slate-100",  iconColor: "text-slate-500",   label: "System"      },
  promo:           { icon: Tag,           bg: "bg-purple-50",  iconColor: "text-purple-600",  label: "Promotion"   },
  low_stock:       { icon: AlertTriangle, bg: "bg-amber-50",   iconColor: "text-amber-500",   label: "Low Stock"   },
};

const ORDER_TYPES: MerchantNotification["type"][] = [
  "new_order", "order_cancelled", "order_ready", "payment",
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function groupByDate(
  notifications: MerchantNotification[]
): { label: string; items: MerchantNotification[] }[] {
  const map = new Map<string, MerchantNotification[]>();

  notifications.forEach((n) => {
    const diff  = Math.floor((Date.now() - new Date(n.created_at).getTime()) / 86_400_000);
    const label =
      diff === 0 ? "Today"
      : diff === 1 ? "Yesterday"
      : diff < 7  ? "This Week"
      : "Older";
    map.set(label, [...(map.get(label) ?? []), n]);
  });

  return ["Today", "Yesterday", "This Week", "Older"]
    .filter((l) => map.has(l))
    .map((label) => ({ label, items: map.get(label)! }));
}

// ─── notification card ────────────────────────────────────────────────────────

function NotificationCard({
  notification,
  onRead,
  onDelete,
}: {
  notification: MerchantNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg  = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system;
  const Icon = cfg.icon;

  return (
    <div
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`relative flex gap-3 p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
        notification.is_read
          ? "bg-card border-border"
          : "bg-primary/5 border-primary/20"
      }`}
    >
      {!notification.is_read && (
        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-primary" />
      )}

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-tight ${
            notification.is_read ? "text-foreground font-medium" : "text-foreground font-bold"
          }`}>
            {notification.title}
          </p>
          <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">
            {timeAgo(notification.created_at)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {notification.body}
        </p>

        {notification.meta && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {notification.meta.order_id && (
              <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                #{String(notification.meta.order_id).slice(0, 8)}
              </span>
            )}
            {notification.meta.amount && (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                ₹{notification.meta.amount}
              </span>
            )}
            {notification.meta.product_name && (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                {notification.meta.product_name}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.iconColor}`}>
            {cfg.label}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
            className="text-muted-foreground active:text-red-500 transition-colors p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function MerchantNotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<FilterTab>("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { data: notifications, isLoading, refetch } = useNotifications();
  const markRead    = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteOne   = useDeleteNotification();
  const clearAll    = useClearAllNotifications();

  const filtered = useMemo(() => {
    if (!notifications) return [];
    if (tab === "unread") return notifications.filter((n) => !n.is_read);
    if (tab === "orders") return notifications.filter((n) => ORDER_TYPES.includes(n.type));
    if (tab === "system") return notifications.filter((n) => !ORDER_TYPES.includes(n.type));
    return notifications;
  }, [notifications, tab]);

  const unreadCount = (notifications ?? []).filter((n) => !n.is_read).length;
  const grouped     = groupByDate(filtered);

  const handleRead = async (id: string) => {
    try { await markRead.mutateAsync(id); }
    catch { toast.error("Failed to mark as read"); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteOne.mutateAsync(id); toast.success("Notification removed"); }
    catch { toast.error("Failed to delete"); }
  };

  const handleMarkAllRead = async () => {
    try { await markAllRead.mutateAsync(); toast.success("All marked as read"); }
    catch { toast.error("Failed to mark all read"); }
  };

  const handleClearAll = async () => {
    try {
      await clearAll.mutateAsync();
      setShowClearConfirm(false);
      toast.success("All notifications cleared");
    } catch { toast.error("Failed to clear notifications"); }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all",    label: "All"    },
    { key: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { key: "orders", label: "Orders" },
    { key: "system", label: "System" },
  ];

  return (
    <MobileLayout navType="merchant">
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Activity</p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      <div className="px-4 pb-28 space-y-4">

        {(notifications ?? []).length > 0 && (
          <div className="flex items-center justify-between">
            {unreadCount > 0 ? (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary active:opacity-70"
              >
                {markAllRead.isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCheck className="w-3.5 h-3.5" />
                }
                Mark all read
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCheck className="w-3.5 h-3.5" />
                All caught up
              </span>
            )}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground active:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}

        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 text-[11px] font-semibold px-2 py-1.5 rounded-lg transition-all duration-200 ${
                tab === t.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {showClearConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-red-800 mb-1">Clear all notifications?</p>
            <p className="text-xs text-red-600 mb-3">
              This will permanently delete all {(notifications ?? []).length} notifications.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 text-xs font-semibold text-foreground bg-white border border-border py-2 rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearAll.isPending}
                className="flex-1 text-xs font-semibold text-white bg-red-500 py-2 rounded-xl active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {clearAll.isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />
                }
                Delete All
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-full" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BellOff className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-sm">
              {tab === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-xs mt-1">
              {tab === "unread" ? "You're all caught up!" : "Order alerts and updates will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex-shrink-0">
                    {group.label}
                  </p>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {group.items.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {group.items.map((n) => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onRead={handleRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </MobileLayout>
  );
}