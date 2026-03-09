import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export interface Offer {
  id: string;
  shop_id: string;
  title: string;
  description: string | null;
  type: "percentage" | "flat" | "bogo" | "free_delivery";
  value: number | null;
  min_order_amount: number;
  code: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export type OfferInsert = Omit<Offer, "id" | "created_at">;

export function useOffers(shopId: string | undefined) {
  return useQuery({
    queryKey: ["offers", shopId],
    enabled: !!shopId,
    staleTime: 30_000,
    queryFn: async (): Promise<Offer[]> => {
      const { data, error } = await sb
        .from("offers")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Offer[];
    },
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offer: OfferInsert) => {
      const { error } = await sb.from("offers").insert(offer);
      if (error) throw error;
    },
    onSuccess: (_: void, vars: OfferInsert) => {
      qc.invalidateQueries({ queryKey: ["offers", vars.shop_id] });
    },
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates, shopId }: { id: string; updates: Partial<Offer>; shopId: string }) => {
      const { error } = await sb.from("offers").update(updates).eq("id", id);
      if (error) throw error;
      return shopId;
    },
    onSuccess: (shopId: string) => {
      qc.invalidateQueries({ queryKey: ["offers", shopId] });
    },
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, shopId }: { id: string; shopId: string }) => {
      const { error } = await sb.from("offers").delete().eq("id", id);
      if (error) throw error;
      return shopId;
    },
    onSuccess: (shopId: string) => {
      qc.invalidateQueries({ queryKey: ["offers", shopId] });
    },
  });
}