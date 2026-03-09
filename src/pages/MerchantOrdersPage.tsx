import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthContext";
import { useMerchantShop } from "@/hooks/useShops";
import { useMerchantOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { Package, Clock, RefreshCw, Store, ChevronRight } from "lucide-react";
import { Order, OrderStatus, getShopTypeIcon } from "@/types";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { MerchantOrderDetailSheet } from "@/components/merchant/MerchantOrderDetailSheet";
import { toast } from "sonner";

type TabType = "new" | "accepted" | "ready" | "completed" | "cancelled";

const TABS: { key: TabType; label: string; statuses: OrderStatus[] }[] = [
  { key: "new", label: "New", statuses: ["placed"] },
  { key: "accepted", label: "Accepted", statuses: ["accepted"] },
  { key: "ready", label: "Ready", statuses: ["ready", "assigned", "pickedUp", "onTheWay"] },
  { key: "completed", label: "Done", statuses: ["delivered"] },
  { key: "cancelled", label: "Cancelled", statuses: ["rejected"] },
];

const STATUS_BADGE: Record<string, string> = {
  placed: "bg-orange-100 text-orange-700",
  accepted: "bg-blue-100 text-blue-700",
  ready: "bg-purple-100 text-purple-700",
  assigned: "bg-purple-100 text-purple-700",
  pickedUp: "bg-indigo-100 text-indigo-700",
  onTheWay: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function MerchantOrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("new");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: shop, isLoading: shopLoading } = useMerchantShop(user?.id);
  const { data: orders = [], isLoading: ordersLoading, refetch } = useMerchantOrders(shop?.id);
  const updateOrderStatus = useUpdateOrderStatus();

  useEffect(() => {
    if (!shop?.id) return;
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [shop?.id, refetch]);

  const currentTab = TABS.find((t) => t.key === activeTab)!;
  const filteredOrders = orders.filter((o) => currentTab.statuses.includes(o.status));

  const getCount = (tab: typeof TABS[0]) =>
    orders.filter((o) => tab.statuses.includes(o.status)).length;

  const handleAccept = async (orderId: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: "accepted" });
      toast.success("Order accepted");
      setSelectedOrder(null);
      refetch();
    } catch { toast.error("Failed to accept"); }
  };

  const handleReject = async (orderId: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: "rejected" });
      toast.error("Order rejected");
      setSelectedOrder(null);
      refetch();
    } catch { toast.error("Failed to reject"); }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: "ready" });
      toast.success("Marked as ready");
      setSelectedOrder(null);
      refetch();
    } catch { toast.error("Failed to update"); }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString();
  };

  if (!shopLoading && !shop) {
    return (
      <MobileLayout navType="merchant">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <Store className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-center">No shop assigned yet</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout navType="merchant">
      {/* Header */}
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Orders</p>
          <h1 className="text-2xl font-bold text-foreground">{shop?.name_en ?? "My Shop"}</h1>
        </div>
        <button onClick={() => refetch()}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      {/* Tabs */}
      <div className="px-4 pb-3">
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => {
            const count = getCount(tab);
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {ordersLoading || shopLoading ? (
        <div className="px-4 space-y-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center">
            No {currentTab.label.toLowerCase()} orders
          </p>
        </div>
      ) : (
        <div className="px-4 pb-28 space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} onClick={() => setSelectedOrder(order)}
              className="bg-card rounded-2xl border border-border p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-transform">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                    {getShopTypeIcon(order.shopType)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[order.status] ?? "bg-muted text-muted-foreground"}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-foreground">₹{order.total}</span>
                </div>
              </div>

              {/* Items preview */}
              {order.items && order.items.length > 0 && (
                <div className="bg-muted/40 rounded-xl p-2.5 mb-2">
                  {order.items.slice(0, 2).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.name_en ?? item.name_te} x{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-primary mt-1">+{order.items.length - 2} more items</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-primary flex items-center gap-1 font-medium">
                  View Details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <MerchantOrderDetailSheet
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAccept={handleAccept}
        onReject={handleReject}
        onMarkReady={handleMarkReady}
      />
    </MobileLayout>
  );
}
