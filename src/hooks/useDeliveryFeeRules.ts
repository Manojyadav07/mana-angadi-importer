import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFeeRule } from '@/types';

// Convert DB rule to app DeliveryFeeRule type
function dbToRule(dbRule: any): DeliveryFeeRule {
  return {
    id: dbRule.id,
    villageKey: dbRule.village_key,
    baseFeeKirana: Number(dbRule.base_fee_kirana || 20),
    baseFeeRestaurant: Number(dbRule.base_fee_restaurant || 25),
    baseFeeMedical: Number(dbRule.base_fee_medical || 30),
    perKmFee: dbRule.per_km_fee ? Number(dbRule.per_km_fee) : undefined,
    freeDeliveryMinOrder: dbRule.free_delivery_min_order ? Number(dbRule.free_delivery_min_order) : undefined,
    maxFeeCap: dbRule.max_fee_cap ? Number(dbRule.max_fee_cap) : undefined,
    minOrderRestaurant: dbRule.min_order_restaurant ? Number(dbRule.min_order_restaurant) : undefined,
    isActive: dbRule.is_active ?? true
  };
}

export function useDeliveryFeeRules() {
  return useQuery({
    queryKey: ['delivery-fee-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_fee_rules')
        .select('*')
        .eq('is_active', true)
        .order('village_key');

      if (error) throw error;
      return data.map(dbToRule);
    }
  });
}

export function useActiveDeliveryFeeRule(villageKey: string = 'metlachittapur') {
  return useQuery({
    queryKey: ['active-delivery-fee-rule', villageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_fee_rules')
        .select('*')
        .eq('village_key', villageKey)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data ? dbToRule(data) : null;
    }
  });
}

export function useUpdateDeliveryFeeRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DeliveryFeeRule> }) => {
      const dbUpdates: any = {};

      if (updates.villageKey !== undefined) dbUpdates.village_key = updates.villageKey;
      if (updates.baseFeeKirana !== undefined) dbUpdates.base_fee_kirana = updates.baseFeeKirana;
      if (updates.baseFeeRestaurant !== undefined) dbUpdates.base_fee_restaurant = updates.baseFeeRestaurant;
      if (updates.baseFeeMedical !== undefined) dbUpdates.base_fee_medical = updates.baseFeeMedical;
      if (updates.perKmFee !== undefined) dbUpdates.per_km_fee = updates.perKmFee;
      if (updates.freeDeliveryMinOrder !== undefined) dbUpdates.free_delivery_min_order = updates.freeDeliveryMinOrder;
      if (updates.maxFeeCap !== undefined) dbUpdates.max_fee_cap = updates.maxFeeCap;
      if (updates.minOrderRestaurant !== undefined) dbUpdates.min_order_restaurant = updates.minOrderRestaurant;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('delivery_fee_rules')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-fee-rules'] });
      queryClient.invalidateQueries({ queryKey: ['active-delivery-fee-rule'] });
    }
  });
}

export function useCreateDeliveryFeeRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Omit<DeliveryFeeRule, 'id'>) => {
      const { data, error } = await supabase
        .from('delivery_fee_rules')
        .insert({
          village_key: rule.villageKey,
          base_fee_kirana: rule.baseFeeKirana,
          base_fee_restaurant: rule.baseFeeRestaurant,
          base_fee_medical: rule.baseFeeMedical,
          per_km_fee: rule.perKmFee,
          free_delivery_min_order: rule.freeDeliveryMinOrder,
          max_fee_cap: rule.maxFeeCap,
          min_order_restaurant: rule.minOrderRestaurant,
          is_active: rule.isActive
        })
        .select()
        .single();

      if (error) throw error;
      return dbToRule(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-fee-rules'] });
    }
  });
}
