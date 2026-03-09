import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const sb = supabase as any;

export interface MerchantNotification {
  id: string;
  type: "new_order" | "order_cancelled" | "order_ready" | "payment" | "system" | "promo" | "low_stock";
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  meta: Record<string, any> | null;
}

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // ── fetch ────────────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey: ["merchant-notifications", user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async (): Promise<MerchantNotification[]> => {
      const { data, error } = await sb
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []) as MerchantNotification[];
    },
  });

  // ── realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const channel = sb
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["merchant-notifications", user.id] });
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [user?.id, qc]);

  return query;
}

export function useMarkRead() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await sb
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchant-notifications", user?.id] });
    },
  });
}

export function useMarkAllRead() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await sb
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchant-notifications", user?.id] });
    },
  });
}

export function useDeleteNotification() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await sb
        .from("notifications")
        .delete()
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchant-notifications", user?.id] });
    },
  });
}

export function useClearAllNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await sb
        .from("notifications")
        .delete()
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchant-notifications", user?.id] });
    },
  });
}