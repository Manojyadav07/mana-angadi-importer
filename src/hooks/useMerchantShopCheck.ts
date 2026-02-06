import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to check if a merchant user has any shops.
 * Returns { hasShop, isLoading, error }
 */
export function useMerchantShopCheck(userId: string | undefined) {
  return useQuery({
    queryKey: ['merchant-shop-check', userId],
    queryFn: async () => {
      if (!userId) return { hasShop: false };

      const { data, error } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', userId)
        .limit(1);

      if (error) throw error;
      return { hasShop: data && data.length > 0 };
    },
    enabled: !!userId,
    staleTime: 30000, // Cache for 30 seconds
  });
}
