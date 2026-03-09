import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const sb = supabase as any;

export interface InventoryProduct {
  id: string;
  name_en: string;
  name_te: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  unit: string | null;
  image_url: string | null;
  is_available: boolean;
  is_active: boolean;
  category: string | null;
  low_stock_threshold: number;
}

export function useInventory(shopId: string | undefined) {
  return useQuery({
    queryKey: ["inventory", shopId],
    enabled: !!shopId,
    staleTime: 30_000,
    queryFn: async (): Promise<InventoryProduct[]> => {
      const { data, error } = await sb
        .from("items")
        .select("id, name_en, name_te, price, mrp, stock, unit, image_url, is_available, is_active, category, low_stock_threshold")
        .eq("shop_id", shopId)
        .order("name_en");

      if (error) throw error;

      return (data ?? []).map((p: any) => ({
        ...p,
        stock:               p.stock               ?? 0,
        low_stock_threshold: p.low_stock_threshold  ?? 5,
        is_available:        p.is_available         ?? true,
        is_active:           p.is_active            ?? true,
      }));
    },
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      stock,
      shopId,
    }: {
      productId: string;
      stock: number;
      shopId: string;
    }) => {
      const { error } = await sb
        .from("items")
        .update({ stock })
        .eq("id", productId);
      if (error) throw error;
      return { productId, stock, shopId };
    },
    onSuccess: ({ shopId }) => {
      qc.invalidateQueries({ queryKey: ["inventory", shopId] });
    },
  });
}

export function useToggleAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      is_available,
      shopId,
    }: {
      productId: string;
      is_available: boolean;
      shopId: string;
    }) => {
      const { error } = await sb
        .from("items")
        .update({ is_available, is_active: is_available })
        .eq("id", productId);
      if (error) throw error;
      return { productId, is_available, shopId };
    },
    onSuccess: ({ shopId }) => {
      qc.invalidateQueries({ queryKey: ["inventory", shopId] });
    },
  });
}

export function useBulkUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      updates,
      shopId,
    }: {
      updates: { id: string; stock: number }[];
      shopId: string;
    }) => {
      await Promise.all(
        updates.map(({ id, stock }) =>
          sb.from("items").update({ stock }).eq("id", id)
        )
      );
      return shopId;
    },
    onSuccess: (shopId) => {
      qc.invalidateQueries({ queryKey: ["inventory", shopId] });
    },
  });
}

export function useMerchantShopId() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["merchant-shop-id", user?.id],
    enabled: !!user?.id,
    staleTime: Infinity,
    queryFn: async (): Promise<string | null> => {
      const { data } = await sb
        .from("profiles")
        .select("shop_id")
        .eq("id", user!.id)
        .single();
      return data?.shop_id ?? null;
    },
  });
}