import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, ShopType } from '@/types';

// Convert DB order to app Order type (simplified version for earnings)
function dbToOrder(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    customerId: dbOrder.user_id,
    shopId: dbOrder.shop_id,
    shopName_te: dbOrder.shop_name_te_snapshot || '',
    shopName_en: dbOrder.shop_name_en_snapshot || '',
    shopType: 'kirana' as ShopType,
    status: 'delivered' as OrderStatus,
    subtotal: Number(dbOrder.subtotal),
    deliveryFee: Number(dbOrder.delivery_fee || 0),
    total: Number(dbOrder.total),
    items: [],
    createdAt: new Date(dbOrder.created_at || dbOrder.placed_at),
    deliveredAt: dbOrder.delivered_at ? new Date(dbOrder.delivered_at) : undefined,
    deliveryPartnerId: dbOrder.delivery_person_id,
    paymentMethod: 'COD' as PaymentMethod,
    paymentStatus: 'Paid' as PaymentStatus,
  };
}

export function useDeliveredOrders(deliveryPersonId: string | undefined) {
  return useQuery({
    queryKey: ['delivery-earnings', deliveryPersonId],
    queryFn: async () => {
      if (!deliveryPersonId) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_person_id', deliveryPersonId)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

      if (error) throw error;
      return data.map(dbToOrder);
    },
    enabled: !!deliveryPersonId
  });
}
