// src/hooks/useVillageFees.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export interface VillageFees {
  id: string;
  name: string;
  delivery_fee: number;
  minimum_order: number;
  tier: number;
  town_id: string;
}

export function useVillageFees(villageId: string | null) {
  return useQuery({
    queryKey: ["village-fees", villageId],
    enabled: !!villageId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("villages")
        .select("id, name, delivery_fee, minimum_order, tier, town_id")
        .eq("id", villageId)
        .single();
      if (error) throw error;
      return data as VillageFees;
    },
  });
}

export function useAllVillages() {
  return useQuery({
    queryKey: ["all-villages"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await sb
        .from("villages")
        .select("id, name, delivery_fee, minimum_order, tier, towns(name)")
        .order("tier", { ascending: true });
      if (error) throw error;
      return (data ?? []) as (VillageFees & { towns: { name: string } })[];
    },
  });
}

export function calculateBulkFee(tier: number, totalWeightKg: number): number {
  if (totalWeightKg <= 15) return 0;
  const fees: Record<number, number> = { 1: 20, 2: 30, 3: 40, 4: 50 };
  return fees[tier] ?? 30;
}