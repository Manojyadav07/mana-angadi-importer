import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrderTotals {
  delivery_fee: number;
  min_order: number;
  total_amount: number;
  village_id: string;
}

/**
 * Calls the calculate_order_totals RPC to get server-side
 * delivery fee, min_order, total from the user's village.
 */
export function useOrderTotals(userId: string | undefined, subtotal: number) {
  return useQuery<OrderTotals | null>({
    queryKey: ['order-totals', userId, subtotal],
    queryFn: async () => {
      if (!userId || subtotal <= 0) return null;

      const { data, error } = await supabase.rpc('calculate_order_totals', {
        p_user_id: userId,
        p_subtotal: subtotal,
      });

      if (error) throw error;
      return data as unknown as OrderTotals;
    },
    enabled: !!userId && subtotal > 0,
    staleTime: 30_000,
  });
}
