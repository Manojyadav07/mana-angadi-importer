import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shop, ShopType } from '@/types';

// Convert DB shop to app Shop type
function dbToShop(dbShop: any): Shop {
  const typeLabels: Record<string, { te: string; en: string }> = {
    kirana: { te: 'కిరాణా', en: 'Grocery' },
    restaurant: { te: 'హోటల్', en: 'Restaurant' },
    medical: { te: 'మెడికల్', en: 'Medical' }
  };

  return {
    id: dbShop.id,
    ownerId: dbShop.owner_id,
    name_te: dbShop.name_te,
    name_en: dbShop.name_en,
    type: dbShop.type as ShopType,
    type_te: typeLabels[dbShop.type]?.te as any || 'కిరాణా',
    type_en: typeLabels[dbShop.type]?.en as any || 'Grocery',
    isOpen: dbShop.is_open ?? true,
    isActive: dbShop.is_active ?? true,
    pickupLat: dbShop.pickup_lat,
    pickupLng: dbShop.pickup_lng,
    upiVpa: dbShop.upi_vpa,
    upiPayeeName: dbShop.upi_payee_name,
    villageId: dbShop.village_id
  };
}

export function useShops() {
  return useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .order('name_en');

      if (error) throw error;
      return data.map(dbToShop);
    }
  });
}

export function useShop(shopId: string | undefined) {
  return useQuery({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      if (!shopId) return null;

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .maybeSingle();

      if (error) throw error;
      return data ? dbToShop(data) : null;
    },
    enabled: !!shopId
  });
}

export function useMerchantShop(ownerId: string | undefined) {
  return useQuery({
    queryKey: ['merchant-shop', ownerId],
    queryFn: async () => {
      if (!ownerId) return null;

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (error) throw error;
      return data ? dbToShop(data) : null;
    },
    enabled: !!ownerId
  });
}

export function useUpdateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Shop> }) => {
      const dbUpdates: any = {};
      
      if (updates.name_te !== undefined) dbUpdates.name_te = updates.name_te;
      if (updates.name_en !== undefined) dbUpdates.name_en = updates.name_en;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.isOpen !== undefined) dbUpdates.is_open = updates.isOpen;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.pickupLat !== undefined) dbUpdates.pickup_lat = updates.pickupLat;
      if (updates.pickupLng !== undefined) dbUpdates.pickup_lng = updates.pickupLng;
      if (updates.upiVpa !== undefined) dbUpdates.upi_vpa = updates.upiVpa;
      if (updates.upiPayeeName !== undefined) dbUpdates.upi_payee_name = updates.upiPayeeName;

      const { error } = await supabase
        .from('shops')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-shop'] });
    }
  });
}

export function useCreateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shop: Omit<Shop, 'id' | 'type_te' | 'type_en'>) => {
      const { data, error } = await supabase
        .from('shops')
        .insert({
          owner_id: shop.ownerId,
          name_te: shop.name_te,
          name_en: shop.name_en,
          type: shop.type,
          is_open: shop.isOpen,
          is_active: shop.isActive,
          pickup_lat: shop.pickupLat,
          pickup_lng: shop.pickupLng,
          upi_vpa: shop.upiVpa,
          upi_payee_name: shop.upiPayeeName,
          village_id: shop.villageId
        })
        .select()
        .single();

      if (error) throw error;
      return dbToShop(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    }
  });
}
