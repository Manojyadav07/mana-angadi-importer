import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingBag, Store, Users, Bike, MapPin, BarChart2,
  Bell, Tag, AlertTriangle, MessageSquare, FileText,
  Settings, Map, IndianRupee, ChevronRight, Clock, X,
} from "lucide-react";

const sb = supabase as any;

function useAdminStats() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    staleTime: 60_000,
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [ordersToday, ordersLive, merchants, riders, disputes] = await Promise.all([
        sb.from("orders").select("id, total").gte("created_at", today.toISOString()),
        sb.from("orders").select("id").in("status", ["confirmed", "preparing", "out_for_delivery"]),
        sb.from("shops").select("id").eq("is_active", true),
        sb.from("profiles").select("id").contains("roles", ["delivery"]),
        sb.from("disputes").select("id").eq("status", "open"),
      ]);
      const revenue = (ordersToday.data ?? []).reduce((s: number, o: any) => s + (o.total ?? 0), 0);
      return {
        ordersToday:  (ordersToday.data ?? []).length,
        revenueToday: revenue,
        liveOrders:   (ordersLive.data ?? []).length,
        merchants:    (merchants.data ?? []).length,
        riders:       (riders.data ?? []).length,
        openDisputes: (disputes.data ?? []).length,
      };
    },
  });
}

function useAdminNotifications() {
  return useQuery({
    queryKey: ["admin-notifications"],
    staleTime: 30_000,
    queryFn: async () => {
      try {
        const { data } = await sb
          .from("notifications")
          .select("*")
          .eq("is_read", false)
          .order("created_at", { ascending: false })
          .limit(20);
        return (data ?? []) as any[];
      } catch {
        return [];
      }
    },
  });
}
export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading } = useAdminStats();
  const { data: notifs = [] } = useAdminNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifs.length;

  const statCards = [
    { label: "Orders Today",  value: stats?.ordersToday ?? 0,                                    color: "text-blue-600",   bg: "bg-blue-50",   icon: ShoppingBag  },
    { label: "Revenue Today", value: `₹${((stats?.revenueToday ?? 0) / 1000).toFixed(1)}k`,      color: "text-green-600",  bg: "bg-green-50",  icon: IndianRupee  },
    { label: "Live Orders",   value: stats?.liveOrders ?? 0,                                     color: "text-amber-600",  bg: "bg-amber-50",  icon: Clock        },
    { label: "Open Disputes", value: stats?.openDisputes ?? 0,                                   color: "text-red-600",    bg: "bg-red-50",    icon: MessageSquare },
  ];

  const sections = [
    {
      heading: "Core Operations",
      items: [
        { label: "Orders",            sub: "Manage, assign & override orders",       icon: ShoppingBag,   path: "/admin/orders",            color: "text-blue-600",   bg: "bg-blue-50",   badge: stats?.liveOrders   },
        { label: "Merchants",         sub: "Enable / disable shops",                 icon: Store,         path: "/admin/merchants",         color: "text-violet-600", bg: "bg-violet-50", badge: null },
        { label: "Delivery Partners", sub: "Riders, status & earnings",              icon: Bike,          path: "/admin/delivery-partners", color: "text-green-600",  bg: "bg-green-50",  badge: null },
        { label: "Customers",         sub: "View order history & block users",       icon: Users,         path: "/admin/customers",         color: "text-orange-600", bg: "bg-orange-50", badge: null },
        { label: "Onboarding",        sub: "Approve / reject applications",          icon: FileText,      path: "/admin/onboarding",        color: "text-pink-600",   bg: "bg-pink-50",   badge: null },
        { label: "Shops",             sub: "View, edit & open/close shops",          icon: Store,         path: "/admin/shops",             color: "text-teal-600",   bg: "bg-teal-50",   badge: null },
      ],
    },
    {
      heading: "Finance",
      items: [
        { label: "Settlements",   sub: "Merchant payout history & mark paid",    icon: IndianRupee, path: "/admin/settlements", color: "text-green-600",  bg: "bg-green-50",  badge: null },
        { label: "Delivery Fees", sub: "Zone fees & platform commission %",       icon: Tag,         path: "/admin/fees",        color: "text-amber-600",  bg: "bg-amber-50",  badge: null },
        { label: "Coupons",       sub: "Platform-wide discount codes",            icon: Tag,         path: "/admin/coupons",     color: "text-pink-600",   bg: "bg-pink-50",   badge: null },
      ],
    },
    {
      heading: "Analytics & Insights",
      items: [
        { label: "Analytics & Reports", sub: "Revenue charts, top merchants & products",  icon: BarChart2,     path: "/admin/analytics",         color: "text-blue-600",  bg: "bg-blue-50",  badge: null },
        { label: "Inventory Alerts",    sub: "Low & out-of-stock across all shops",        icon: AlertTriangle, path: "/admin/inventory-alerts",  color: "text-red-600",   bg: "bg-red-50",   badge: null },
        { label: "Live Map",            sub: "Active riders & live order tracking",         icon: Map,           path: "/admin/live-map",          color: "text-green-600", bg: "bg-green-50", badge: stats?.liveOrders },
      ],
    },
    {
      heading: "Communication",
      items: [
        { label: "Broadcasts", sub: "Send announcements to users",             icon: Bell,         path: "/admin/broadcasts", color: "text-violet-600", bg: "bg-violet-50", badge: null },
        { label: "Disputes",   sub: "Resolve customer & merchant complaints",  icon: MessageSquare,path: "/admin/disputes",   color: "text-orange-600", bg: "bg-orange-50", badge: stats?.openDisputes },
      ],
    },
    {
      heading: "Configuration",
      items: [
        { label: "Villages & Towns", sub: "Service areas & delivery zones", icon: MapPin,  path: "/admin/villages", color: "text-teal-600",  bg: "bg-teal-50",   badge: null },
        { label: "Admin Profile",    sub: "Your account settings",          icon: Settings, path: "/admin/profile",  color: "text-slate-600", bg: "bg-slate-100", badge: null },
      ],
    },
  ];

  const markAllRead = async () => {
    await sb.from("notifications").update({ is_read: true }).eq("is_read", false);
    setShowNotifs(false);
  };

  return (
    <MobileLayout navType="admin">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Admin Panel</p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
        <button
          onClick={() => setShowNotifs(true)}
          className="relative w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform mt-1"
        >
          <Bell className="w-5 h-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </header>

      <div className="px-4 pb-28 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
                {isLoading
                  ? <div className="h-6 w-14 bg-muted animate-pulse rounded mb-1" />
                  : <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
                }
                <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
              </div>
            );
          })}
        </div>

        {/* Platform overview */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Platform Overview</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Active Shops", value: stats?.merchants ?? 0, icon: Store, color: "text-violet-600" },
              { label: "Total Riders", value: stats?.riders    ?? 0, icon: Bike,  color: "text-green-600"  },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                  <Icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                  <div>
                    {isLoading
                      ? <div className="h-5 w-8 bg-muted animate-pulse rounded mb-0.5" />
                      : <p className="text-lg font-black text-foreground">{item.value}</p>
                    }
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nav sections */}
        {sections.map((section) => (
          <div key={section.heading}>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
              {section.heading}
            </p>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-muted transition-colors text-left ${
                      idx < section.items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.badge != null && item.badge > 0 && (
                        <span className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <p className="text-center text-[10px] text-muted-foreground/40 pb-2">Mana Angadi Admin · v1.0.0</p>
      </div>

      {/* Notifications panel */}
      {showNotifs && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNotifs(false)} />
          <div className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[70vh] overflow-y-auto pb-8">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                Notifications {unreadCount > 0 && <span className="text-primary">({unreadCount})</span>}
              </h2>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-semibold text-primary">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotifs(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="px-5 space-y-2">
              {notifs.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                </div>
              ) : notifs.map((n: any) => (
                <div key={n.id} className="bg-muted/50 rounded-xl p-3">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {new Date(n.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}


