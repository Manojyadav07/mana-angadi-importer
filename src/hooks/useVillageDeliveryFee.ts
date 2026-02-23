import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VillageFee {
  id: string;
  name: string;
  delivery_fee: number;
  min_order: number;
}

/**
 * Fetch delivery-fee rules for a specific village from the `villages` table.
 * Defaults to "Metlachittapur" (mapped to "Main Village" seed row).
 */
export function useVillageDeliveryFee(villageName: string = 'Main Village') {
  return useQuery<VillageFee | null>({
    queryKey: ['village-delivery-fee', villageName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .eq('name', villageName)
        .maybeSingle();

      if (error) throw error;
      return data as VillageFee | null;
    },
  });
}

/**
 * Fetch all villages (for a future village-picker).
 */
export function useAllVillages() {
  return useQuery<VillageFee[]>({
    queryKey: ['villages-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []) as VillageFee[];
    },
  });
}
