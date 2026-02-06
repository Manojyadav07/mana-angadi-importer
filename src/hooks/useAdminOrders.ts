import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, ShopType, PaymentMethod, PaymentStatus } from '@/types';

function mapDbStatus(dbStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    placed: 'placed',
    accepted: 'accepted',
    ready: 'ready',
    assigned: 'assigned',
    picked_up: 'pickedUp',
    on_the_way: 'onTheWay',
    delivered: 'delivered',
    cancelled: 'rejected',
  };
  return statusMap[dbStatus] || 'placed';
}

function dbToOrder(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    customerId: dbOrder.user_id,
    shopId: dbOrder.shop_id,
    shopName_te: dbOrder.shop_name_te_snapshot || '',
    shopName_en: dbOrder.shop_name_en_snapshot || '',
    shopType: 'kirana' as ShopType,
    status: mapDbStatus(dbOrder.status),
    subtotal: Number(dbOrder.subtotal),
    deliveryFee: Number(dbOrder.delivery_fee || 0),
    total: Number(dbOrder.total),
    items: [],
    createdAt: new Date(dbOrder.created_at || dbOrder.placed_at),
    statusUpdatedAt: dbOrder.updated_at ? new Date(dbOrder.updated_at) : undefined,
    deliveryPartnerId: dbOrder.delivery_person_id,
    onTheWayAt: dbOrder.on_the_way_at ? new Date(dbOrder.on_the_way_at) : undefined,
    deliveredAt: dbOrder.delivered_at ? new Date(dbOrder.delivered_at) : undefined,
    paymentMethod: (dbOrder.payment_method?.toUpperCase() || 'COD') as PaymentMethod,
    paymentStatus: (dbOrder.payment_status ? dbOrder.payment_status.charAt(0).toUpperCase() + dbOrder.payment_status.slice(1) : 'Unpaid') as PaymentStatus,
  };
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(dbToOrder);
    },
  });
}
