import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Bell, Plus, Send, ChevronLeft, Loader2,
  Users, Store, Bike, Globe, Trash2, X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

type TargetRole = "all" | "merchant" | "customer" | "delivery";

const TARGET_CONFIG: Record<TargetRole, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  all:      { label: "Everyone",           icon: Globe,  color: "text-blue-600",   bg: "bg-blue-50"   },
  merchant: { label: "Merchants Only",     icon: Store,  color: "text-violet-600", bg: "bg-violet-50" },
  customer: { label: "Customers Only",     icon: Users,  color: "text-green-600",  bg: "bg-green-50"  },
  delivery: { label: "Delivery Partners",  icon: Bike,   color: "text-orange-600", bg: "bg-orange-50" },
};

function useBroadcasts() {
  return useQuery({
    queryKey: ["admin-broadcasts"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("admin_broadcasts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

function timeAgo(ts: string) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function AdminBroadcastsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc       = useQueryClient();
  const { data: broadcasts, isLoading } = useBroadcasts();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [title,     setTitle]     = useState("");
  const [message,   setMessage]   = useState("");
  const [target,    setTarget]    = useState<TargetRole>("all");
  const [sending,   setSending]   = useState(false);

  const createBroadcast = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await sb.from("admin_broadcasts").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-broadcasts"] }),
  });

  const deleteBroadcast = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("admin_broadcasts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-broadcasts"] }),
  });

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }
    setSending(true);
    try {
      await createBroadcast.mutateAsync({
        title:        title.trim(),
        message:      message.trim(),
        target_role:  target,
        is_sent:      true,
        sent_at:      new Date().toISOString(),
        created_by:   user?.id,
      });
      toast.success("Broadcast sent!");
      setTitle(""); setMessage(""); setTarget("all"); setSheetOpen(false);
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBroadcast.mutateAsync(id);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <MobileLayout navType="admin">
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Admin</p>
            <h1 className="text-2xl font-bold text-foreground">Broadcasts</h1>
          </div>
        </div>
        <button onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform">
          <Plus className="w-4 h-4" /> New
        </button>
      </header>

      <div className="px-4 pb-28 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-full" />
            </div>
          ))
        ) : (broadcasts ?? []).length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <p className="font-bold text-foreground text-sm">No broadcasts yet</p>
            <p className="text-xs text-muted-foreground mt-1">Send announcements to your users</p>
          </div>
        ) : (broadcasts ?? []).map((b: any) => {
          const cfg  = TARGET_CONFIG[b.target_role as TargetRole] ?? TARGET_CONFIG.all;
          const Icon = cfg.icon;
          return (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{b.title}</p>
                    <button onClick={() => handleDelete(b.id)}
                      className="flex-shrink-0 w-7 h-7 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform">
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.message}</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] text-muted-foreground">Sent {timeAgo(b.sent_at ?? b.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compose sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto pb-10">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="px-5 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">New Broadcast</h2>
              <button onClick={() => setSheetOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 space-y-4">
              {/* Target */}
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-2 block">Send To</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(TARGET_CONFIG) as [TargetRole, typeof TARGET_CONFIG[TargetRole]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={key} onClick={() => setTarget(key)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${target === key ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-semibold">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New Feature Available"
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Message *</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                  placeholder="Write your announcement here..."
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{message.length}/500</p>
              </div>
              <button onClick={handleSend} disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-60">
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {sending ? "Sending..." : "Send Broadcast"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}





