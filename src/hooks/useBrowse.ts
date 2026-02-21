import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BrowseShop {
  id: string;
  name: string;
  address: string | null;
}

export interface BrowseItem {
  id: string;
  name: string;
  price: number;
  shop_id: string;
  is_active: boolean;
  created_at: string | null;
  shop_name?: string;
}

/** Fetch all shops from public.shops (public read policy) */
export function useBrowseShops() {
  return useQuery({
    queryKey: ['browse-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, address')
        .order('name');

      if (error) throw error;
      return data as BrowseShop[];
    },
  });
}

/**
 * Fetch items from public.items (public read policy).
 * Joins shop name. Supports search + optional shop filter.
 */
export function useBrowseItems(search: string, shopFilter: string | null) {
  return useQuery({
    queryKey: ['browse-items', search, shopFilter],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select('id, name, price, shop_id, is_active, created_at, shops(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (shopFilter) {
        query = query.eq('shop_id', shopFilter);
      }

      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as any[]).map((row): BrowseItem => ({
        id: row.id,
        name: row.name,
        price: Number(row.price),
        shop_id: row.shop_id,
        is_active: row.is_active ?? true,
        created_at: row.created_at,
        shop_name: row.shops?.name ?? undefined,
      }));
    },
  });
}
