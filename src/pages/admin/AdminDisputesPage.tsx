import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle, ChevronLeft, ChevronRight, Loader2,
  CheckCircle2, XCircle, Clock, Filter, MessageSquare, X,
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

type DisputeStatus = "open" | "in_review" | "resolved" | "rejected";

const STATUS_CONFIG: Record<DisputeStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  open:      { label: "Open",      color: "text-red-600",    bg: "bg-red-50",    icon: AlertTriangle  },
  in_review: { label: "In Review", color: "text-amber-600",  bg: "bg-amber-50",  icon: Clock          },
  resolved:  { label: "Resolved",  color: "text-green-600",  bg: "bg-green-50",  icon: CheckCircle2   },
  rejected:  { label: "Rejected",  color: "text-slate-600",  bg: "bg-slate-100", icon: XCircle        },
};

const TYPE_LABELS: Record<string, string> = {
  wrong_item:    "Wrong Item Delivered",
  not_delivered: "Not Delivered",
  quality:       "Quality Issue",
  payment:       "Payment Problem",
  other:         "Other",
};

function useDisputes(status: DisputeStatus | "all") {
  return useQuery({
    queryKey: ["admin-disputes", status],
    staleTime: 30_000,
    queryFn: async () => {
      let q = sb.from("disputes").select("*, profiles(full_name, email)").order("created_at", { ascending: false });
      if (status !== "all") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

function timeAgo(ts: string) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function AdminDisputesPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("all");
  const [selected,     setSelected]     = useState<any | null>(null);
  const [resolution,   setResolution]   = useState("");
  const [updating,     setUpdating]     = useState(false);

  const { data: disputes, isLoading } = useDisputes(statusFilter);

  const updateDispute = useMutation({
    mutationFn: async ({ id, status, resolution }: any) => {
      const { error } = await sb.from("disputes").update({
        status, resolution: resolution || null,
        resolved_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-disputes"] });
    },
  });

  const handleUpdateStatus = async (newStatus: DisputeStatus) => {
    if (!selected) return;
    setUpdating(true);
    try {
      await updateDispute.mutateAsync({ id: selected.id, status: newStatus, resolution });
      toast.success(`Dispute marked as ${newStatus}`);
      setSelected(null); setResolution("");
    } catch { toast.error("Failed to update"); }
    finally { setUpdating(false); }
  };

  const tabs: { key: DisputeStatus | "all"; label: string }[] = [
    { key: "all",      label: "All"       },
    { key: "open",     label: "Open"      },
    { key: "in_review",label: "Review"    },
    { key: "resolved", label: "Resolved"  },
  ];

  const counts = {
    open:      (disputes ?? []).filter((d: any) => d.status === "open").length,
    in_review: (disputes ?? []).filter((d: any) => d.status === "in_review").length,
  };

  return (
    <MobileLayout navType="admin">
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Admin</p>
          <h1 className="text-2xl font-bold text-foreground">Disputes</h1>
        </div>
        {(counts.open + counts.in_review) > 0 && (
          <span className="min-w-[24px] h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-2">
            {counts.open + counts.in_review}
          </span>
        )}
      </header>

      <div className="px-4 pb-28 space-y-4">
        {/* Summary chips */}
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const count = (disputes ?? []).filter((d: any) => d.status === key).length;
            return (
              <div key={key} className={`${cfg.bg} border border-border rounded-2xl p-3 text-center`}>
                <p className={`text-lg font-black ${cfg.color}`}>{count}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setStatusFilter(t.key)}
              className={`flex-1 text-[10px] font-semibold py-1.5 rounded-lg transition-all ${statusFilter === t.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-full" />
            </div>
          ))
        ) : (disputes ?? []).length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-bold text-foreground text-sm">No disputes found</p>
          </div>
        ) : (disputes ?? []).map((d: any) => {
          const cfg  = STATUS_CONFIG[d.status as DisputeStatus] ?? STATUS_CONFIG.open;
          const Icon = cfg.icon;
          return (
            <button key={d.id} onClick={() => { setSelected(d); setResolution(d.resolution ?? ""); }}
              className="w-full bg-card border border-border rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {TYPE_LABELS[d.type] ?? d.type}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {d.profiles?.full_name ?? d.raised_by_role}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(d.created_at)}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto pb-10">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-muted-foreground/20" /></div>
            <div className="px-5 pb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Dispute Detail</h2>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Type</span>
                  <span className="text-xs font-semibold text-foreground">{TYPE_LABELS[selected.type] ?? selected.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Raised by</span>
                  <span className="text-xs font-semibold text-foreground">{selected.profiles?.full_name ?? selected.raised_by_role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className={`text-xs font-bold ${STATUS_CONFIG[selected.status as DisputeStatus]?.color}`}>
                    {STATUS_CONFIG[selected.status as DisputeStatus]?.label}
                  </span>
                </div>
                {selected.order_id && (
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Order ID</span>
                    <span className="text-xs font-mono text-foreground">{selected.order_id.slice(0, 8)}...</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1.5">Description</p>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Resolution Note</label>
                <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3}
                  placeholder="Describe how this dispute was resolved..."
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              {selected.status === "open" && (
                <button onClick={() => handleUpdateStatus("in_review")} disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-60">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  Mark In Review
                </button>
              )}
              {(selected.status === "open" || selected.status === "in_review") && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleUpdateStatus("resolved")} disabled={updating}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-60">
                    <CheckCircle2 className="w-4 h-4" /> Resolve
                  </button>
                  <button onClick={() => handleUpdateStatus("rejected")} disabled={updating}
                    className="flex items-center justify-center gap-2 bg-muted text-muted-foreground font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-60">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}





