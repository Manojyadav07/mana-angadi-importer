// src/pages/admin/AdminShopsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft, Store, Search,
  ToggleLeft, ToggleRight, RefreshCw, MapPin,
} from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

function useAdminShops() {
  return useQuery({
    queryKey: ["admin-shops"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("shops")
        .select("id, name, name_en, category, phone, logo_url, is_approved, created_at, towns(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function AdminShopsPage() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const { data: shops, isLoading, refetch } = useAdminShops();
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<"all" | "pending" | "approved">("all");

  const toggleApproval = useMutation({
    mutationFn: async ({ id, current }: { id: string; current: boolean }) => {
      const { error } = await sb
        .from("shops")
        .update({ is_approved: !current })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-shops"] });
      toast.success("Shop approval updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const all      = shops ?? [];
  const approved = all.filter((s: any) => s.is_approved);
  const pending  = all.filter((s: any) => !s.is_approved);

  const filtered = all.filter((s: any) => {
    const matchSearch = !search.trim() ||
      (s.name ?? s.name_en ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"      ? true :
      filter === "approved" ? s.is_approved :
      !s.is_approved;
    return matchSearch && matchFilter;
  });

  const FILTER_TABS: { key: typeof filter; label: string; count: number }[] = [
    { key: "all",      label: "All",      count: all.length      },
    { key: "pending",  label: "Pending",  count: pending.length  },
    { key: "approved", label: "Approved", count: approved.length },
  ];

  return (
    <MobileLayout navType="admin">
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Admin</p>
            <h1 className="text-2xl font-bold text-foreground">Shops</h1>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      <div className="px-4 pb-28 space-y-4">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total",    value: all.length,      color: "text-foreground",  bg: "bg-card"      },
            { label: "Pending",  value: pending.length,  color: "text-amber-600",   bg: "bg-amber-50"  },
            { label: "Approved", value: approved.length, color: "text-green-600",   bg: "bg-green-50"  },
          ].map((c) => (
            <div key={c.label} className={`${c.bg} border border-border rounded-2xl p-3 text-center`}>
              <p className={`text-xl font-black ${c.color}`}>
                {isLoading ? "—" : c.value}
              </p>
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1 rounded-full ${
                filter === tab.key ? "bg-primary/10 text-primary" : "bg-border text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops…"
            className="input-village pl-9"
          />
        </div>

        {/* ── List ── */}
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <div className="h-4 bg-muted rounded animate-pulse w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold text-muted-foreground">No shops found</p>
          </div>
        ) : filtered.map((s: any) => {
          const shopName = s.name ?? s.name_en ?? "Unnamed Shop";
          return (
            <div key={s.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {s.logo_url
                    ? <img src={s.logo_url} alt="" className="w-full h-full object-cover" />
                    : <Store className="w-5 h-5 text-muted-foreground" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{shopName}</p>

                  <div className="flex items-center gap-1 mt-0.5">
                    {s.category && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                        {s.category}
                      </span>
                    )}
                    {(s.towns as any)?.name && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {(s.towns as any).name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.is_approved
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {s.is_approved ? "Approved" : "Pending"}
                    </span>
                    {s.phone && (
                      <span className="text-[10px] text-muted-foreground">{s.phone}</span>
                    )}
                  </div>
                </div>

                {/* Approval toggle */}
                <button
                  onClick={() => toggleApproval.mutate({ id: s.id, current: s.is_approved })}
                  disabled={toggleApproval.isPending}
                  className="active:scale-90 transition-transform flex-shrink-0 disabled:opacity-50"
                  title={s.is_approved ? "Revoke approval" : "Approve shop"}
                >
                  {s.is_approved
                    ? <ToggleRight className="w-9 h-9 text-green-500" />
                    : <ToggleLeft  className="w-9 h-9 text-muted-foreground" />
                  }
                </button>
              </div>

              {/* Pending action banner */}
              {!s.is_approved && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-amber-600 font-semibold">
                    Waiting for approval — not visible to customers
                  </p>
                  <button
                    onClick={() => toggleApproval.mutate({ id: s.id, current: false })}
                    disabled={toggleApproval.isPending}
                    className="text-xs font-bold text-white bg-green-500 px-3 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}