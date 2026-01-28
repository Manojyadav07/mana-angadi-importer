import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export function useUpdateDeliveryLocation() {
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      deliveryPersonId, 
      lat, 
      lng 
    }: { 
      orderId: string; 
      deliveryPersonId: string;
      lat: number; 
      lng: number;
    }) => {
      const { error } = await supabase
        .from('delivery_location_updates')
        .insert({
          order_id: orderId,
          delivery_person_id: deliveryPersonId,
          lat,
          lng,
        });

      if (error) throw error;
    }
  });
}

export function useDeliveryEarnings(deliveryPersonId: string | undefined) {
  // This would fetch from a dedicated earnings table or compute from orders
  // For now, we'll compute from delivered orders in the component
  return { data: null };
}
