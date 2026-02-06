import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, ShopType } from '@/types';

// Map DB status to app status
function mapDbStatus(dbStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    placed: 'placed',
    accepted: 'accepted',
    ready: 'ready',
    assigned: 'assigned',
    picked_up: 'pickedUp',
    on_the_way: 'onTheWay',
    delivered: 'delivered',
    cancelled: 'rejected'
  };
  return statusMap[dbStatus] || 'placed';
}

// Map app status to DB status
function mapAppStatus(appStatus: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    placed: 'placed',
    accepted: 'accepted',
    rejected: 'cancelled',
    ready: 'ready',
    assigned: 'assigned',
    pickedUp: 'picked_up',
    onTheWay: 'on_the_way',
    delivered: 'delivered'
  };
  return statusMap[appStatus] || 'placed';
}

// Convert DB order to app Order type
function dbToOrder(dbOrder: any, items: OrderItem[] = []): Order {
  return {
    id: dbOrder.id,
    customerId: dbOrder.user_id,
    shopId: dbOrder.shop_id,
    shopName_te: dbOrder.shop_name_te_snapshot || '',
    shopName_en: dbOrder.shop_name_en_snapshot || '',
    shopType: 'kirana' as ShopType, // Default, would need join to get actual type
    status: mapDbStatus(dbOrder.status),
    subtotal: Number(dbOrder.subtotal),
    deliveryFee: Number(dbOrder.delivery_fee || 0),
    total: Number(dbOrder.total),
    items,
    createdAt: new Date(dbOrder.created_at || dbOrder.placed_at),
    statusUpdatedAt: dbOrder.updated_at ? new Date(dbOrder.updated_at) : undefined,
    acceptedAt: dbOrder.accepted_at ? new Date(dbOrder.accepted_at) : undefined,
    readyAt: dbOrder.ready_at ? new Date(dbOrder.ready_at) : undefined,
    deliveryPartnerId: dbOrder.delivery_person_id,
    assignedAt: dbOrder.assigned_at ? new Date(dbOrder.assigned_at) : undefined,
    pickedUpAt: dbOrder.picked_up_at ? new Date(dbOrder.picked_up_at) : undefined,
    onTheWayAt: dbOrder.on_the_way_at ? new Date(dbOrder.on_the_way_at) : undefined,
    deliveredAt: dbOrder.delivered_at ? new Date(dbOrder.delivered_at) : undefined,
    deliveryAddressId: dbOrder.delivery_address_id,
    customerAddressText_te: dbOrder.customer_address_text_te,
    customerAddressText_en: dbOrder.customer_address_text_en,
    deliveryInstructions_te: dbOrder.delivery_instructions_te,
    deliveryInstructions_en: dbOrder.delivery_instructions_en,
    pickupLatSnapshot: dbOrder.shop_pickup_lat,
    pickupLngSnapshot: dbOrder.shop_pickup_lng,
    dropLatSnapshot: dbOrder.drop_lat,
    dropLngSnapshot: dbOrder.drop_lng,
    approxDistanceKm: dbOrder.approx_distance_km ? Number(dbOrder.approx_distance_km) : undefined,
    etaMin: dbOrder.eta_min,
    etaMax: dbOrder.eta_max,
    paymentMethod: (dbOrder.payment_method?.toUpperCase() || 'COD') as PaymentMethod,
    paymentStatus: (dbOrder.payment_status ? dbOrder.payment_status.charAt(0).toUpperCase() + dbOrder.payment_status.slice(1) : 'Unpaid') as PaymentStatus,
    upiVpaUsed: dbOrder.upi_vpa_used,
    upiTxnRef: dbOrder.upi_txn_ref,
    upiProofImageUrl: dbOrder.upi_proof_image_url,
    paidAt: dbOrder.paid_at ? new Date(dbOrder.paid_at) : undefined,
    codChangeNeededFor: dbOrder.cod_change_needed_for,
    customerNote: dbOrder.note
  };
}

// Convert DB order item to app OrderItem
function dbToOrderItem(dbItem: any): OrderItem {
  return {
    productId: dbItem.product_id || '',
    productName_te: dbItem.product_name_te_snapshot,
    productName_en: dbItem.product_name_en_snapshot,
    quantity: dbItem.quantity,
    price: Number(dbItem.product_price_snapshot)
  };
}

export function useCustomerOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ['customer-orders', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return dbToOrder(order, items?.map(dbToOrderItem) || []);
        })
      );

      return ordersWithItems;
    },
    enabled: !!userId
  });
}

export function useMerchantOrders(shopId: string | undefined) {
  return useQuery({
    queryKey: ['merchant-orders', shopId],
    queryFn: async () => {
      if (!shopId) return [];

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return dbToOrder(order, items?.map(dbToOrderItem) || []);
        })
      );

      return ordersWithItems;
    },
    enabled: !!shopId
  });
}

export function useDeliveryOrders(deliveryPersonId: string | undefined) {
  return useQuery({
    queryKey: ['delivery-orders', deliveryPersonId],
    queryFn: async () => {
      if (!deliveryPersonId) return { available: [], assigned: [] };

      // Get available orders (ready but not assigned)
      const { data: availableOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'ready')
        .is('delivery_person_id', null)
        .order('created_at', { ascending: false });

      // Get assigned orders for this delivery person
      const { data: assignedOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_person_id', deliveryPersonId)
        .in('status', ['assigned', 'picked_up', 'on_the_way'])
        .order('created_at', { ascending: false });

      const mapOrders = async (orders: any[]) => {
        return Promise.all(
          orders.map(async (order) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);

            return dbToOrder(order, items?.map(dbToOrderItem) || []);
          })
        );
      };

      return {
        available: await mapOrders(availableOrders || []),
        assigned: await mapOrders(assignedOrders || [])
      };
    },
    enabled: !!deliveryPersonId
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;
      if (!order) return null;

      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      return dbToOrder(order, items?.map(dbToOrderItem) || []);
    },
    enabled: !!orderId
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      userId: string;
      shopId: string;
      shopNameTe: string;
      shopNameEn: string;
      shopPickupLat?: number;
      shopPickupLng?: number;
      items: Array<{
        productId: string;
        productNameTe: string;
        productNameEn: string;
        price: number;
        quantity: number;
        imageUrl?: string;
      }>;
      subtotal: number;
      deliveryFee: number;
      total: number;
      paymentMethod: PaymentMethod;
      codChangeNeededFor?: number;
      upiTxnRef?: string;
      addressId?: string;
      addressTextTe?: string;
      addressTextEn?: string;
      dropLat?: number;
      dropLng?: number;
      deliveryInstructionsTe?: string;
      deliveryInstructionsEn?: string;
      approxDistanceKm?: number;
      etaMin?: number;
      etaMax?: number;
      note?: string;
    }) => {
      // Create the order
      const orderInsert = {
        user_id: orderData.userId,
        shop_id: orderData.shopId,
        shop_name_te_snapshot: orderData.shopNameTe,
        shop_name_en_snapshot: orderData.shopNameEn,
        shop_pickup_lat: orderData.shopPickupLat,
        shop_pickup_lng: orderData.shopPickupLng,
        subtotal: orderData.subtotal,
        delivery_fee: orderData.deliveryFee,
        total: orderData.total,
        payment_method: orderData.paymentMethod.toLowerCase() as 'cod' | 'upi',
        payment_status: (orderData.paymentMethod === 'UPI' ? 'pending' : 'unpaid') as 'unpaid' | 'pending',
        cod_change_needed_for: orderData.codChangeNeededFor,
        upi_txn_ref: orderData.upiTxnRef,
        delivery_address_id: orderData.addressId,
        customer_address_text_te: orderData.addressTextTe,
        customer_address_text_en: orderData.addressTextEn,
        drop_lat: orderData.dropLat,
        drop_lng: orderData.dropLng,
        delivery_instructions_te: orderData.deliveryInstructionsTe,
        delivery_instructions_en: orderData.deliveryInstructionsEn,
        approx_distance_km: orderData.approxDistanceKm,
        eta_min: orderData.etaMin,
        eta_max: orderData.etaMax,
        note: orderData.note,
        status: 'placed' as const
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsert)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name_te_snapshot: item.productNameTe,
        product_name_en_snapshot: item.productNameEn,
        product_price_snapshot: item.price,
        product_image_url_snapshot: item.imageUrl,
        quantity: item.quantity,
        line_total: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-orders'] });
    }
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const dbStatus = mapAppStatus(status);
      const updates: any = { status: dbStatus };

      // Set timestamp based on status
      const now = new Date().toISOString();
      switch (status) {
        case 'accepted':
          updates.accepted_at = now;
          break;
        case 'ready':
          updates.ready_at = now;
          break;
        case 'assigned':
          updates.assigned_at = now;
          break;
        case 'pickedUp':
          updates.picked_up_at = now;
          break;
        case 'onTheWay':
          updates.on_the_way_at = now;
          break;
        case 'delivered':
          updates.delivered_at = now;
          updates.payment_status = 'paid';
          updates.paid_at = now;
          break;
        case 'rejected':
          updates.cancelled_at = now;
          break;
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    }
  });
}

export function useAcceptDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, deliveryPersonId }: { orderId: string; deliveryPersonId: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          delivery_person_id: deliveryPersonId,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    }
  });
}
