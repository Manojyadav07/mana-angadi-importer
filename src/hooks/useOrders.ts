import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Lightweight types matching real DB schema ──
export interface DbOrder {
  id: string;
  user_id: string;
  shop_id: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  status: string | null;
  created_at: string | null;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderWithDetails extends DbOrder {
  shop_name?: string;
  items: (DbOrderItem & { item_name?: string; item_image_url?: string | null })[];
}

// ── Queries ──

export function useCustomerOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ['customer-orders', userId],
    queryFn: async (): Promise<OrderWithDetails[]> => {
      if (!userId) return [];

      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, user_id, shop_id, subtotal, delivery_fee, total_amount, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!orders || orders.length === 0) return [];

      // Fetch shop names
      const shopIds = [...new Set(orders.map((o: any) => o.shop_id))];
      const { data: shops } = await supabase.from('shops').select('id, name').in('id', shopIds);
      const shopMap = new Map((shops || []).map((s: any) => [s.id, s.name]));

      return orders.map((o: any) => ({
        ...o,
        shop_name: shopMap.get(o.shop_id) || 'Shop',
        items: [],
      }));
    },
    enabled: !!userId,
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<OrderWithDetails | null> => {
      if (!orderId) return null;

      const { data: order, error } = await supabase
        .from('orders')
        .select('id, user_id, shop_id, subtotal, delivery_fee, total_amount, status, created_at')
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;
      if (!order) return null;

      // shop name
      const { data: shop } = await supabase.from('shops').select('id, name').eq('id', (order as any).shop_id).maybeSingle();

      // order items
      const { data: rawItems } = await supabase
        .from('order_items')
        .select('id, order_id, item_id, quantity, unit_price, total_price')
        .eq('order_id', orderId);

      // item details
      const itemIds = (rawItems || []).map((i: any) => i.item_id);
      let itemMap = new Map<string, { name: string; image_url: string | null }>();
      if (itemIds.length > 0) {
        const { data: items } = await supabase.from('items').select('id, name, image_url').in('id', itemIds);
        itemMap = new Map((items || []).map((i: any) => [i.id, { name: i.name, image_url: i.image_url }]));
      }

      const enrichedItems = (rawItems || []).map((ri: any) => {
        const info = itemMap.get(ri.item_id);
        return { ...ri, item_name: info?.name || 'Item', item_image_url: info?.image_url ?? null };
      });

      return {
        ...(order as any),
        shop_name: (shop as any)?.name || 'Shop',
        items: enrichedItems,
      };
    },
    enabled: !!orderId,
  });
}

// ── Create orders (grouped by shop) ──

interface PlaceOrderInput {
  userId: string;
  cartItems: {
    item_id: string;
    shop_id: string;
    quantity: number;
    item_price: number;
    item_name: string;
    shop_name: string;
  }[];
  paymentMethod?: 'cod' | 'upi';
  cashChangeFor?: number | null;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PlaceOrderInput): Promise<{ orderIds: string[]; shopNames: string[]; totals: number[] }> => {
      // Group by shop
      const byShop = new Map<string, typeof input.cartItems>();
      for (const ci of input.cartItems) {
        const arr = byShop.get(ci.shop_id) || [];
        arr.push(ci);
        byShop.set(ci.shop_id, arr);
      }

      const orderIds: string[] = [];
      const shopNames: string[] = [];
      const totals: number[] = [];

      for (const [shopId, items] of byShop) {
        const subtotal = items.reduce((s, i) => s + i.item_price * i.quantity, 0);
        const delivery_fee = 25;
        const total_amount = subtotal + delivery_fee;

        const { data: order, error: oErr } = await supabase
          .from('orders')
          .insert({
            user_id: input.userId,
            shop_id: shopId,
            subtotal,
            delivery_fee,
            total_amount,
            status: 'pending',
            payment_method: input.paymentMethod || 'cod',
            cash_change_for: input.cashChangeFor ?? null,
          } as any)
          .select('id')
          .single();

        if (oErr) throw oErr;

        const orderItemRows = items.map(i => ({
          order_id: (order as any).id,
          item_id: i.item_id,
          quantity: i.quantity,
          unit_price: i.item_price,
          total_price: i.item_price * i.quantity,
        }));

        const { error: iErr } = await supabase.from('order_items').insert(orderItemRows);
        if (iErr) throw iErr;

        orderIds.push((order as any).id);
        shopNames.push(items[0].shop_name);
        totals.push(total_amount);
      }

      // Clear cart
      await supabase.from('cart_items').delete().eq('user_id', input.userId);

      return { orderIds, shopNames, totals };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
  });
}

// ── Legacy exports used by Merchant/Delivery pages ──
// These reference columns that may not exist in the simple schema,
// but we keep them so those pages don't break at import time.

export function useMerchantOrders(shopId: string | undefined) {
  return useQuery({
    queryKey: ['merchant-orders', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('id, user_id, shop_id, subtotal, delivery_fee, total_amount, status, created_at')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((o: any) => ({
        id: o.id,
        customerId: o.user_id,
        shopId: o.shop_id,
        shopName_te: '', shopName_en: '',
        shopType: 'kirana' as any,
        status: o.status || 'pending',
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.delivery_fee),
        total: Number(o.total_amount),
        items: [],
        createdAt: new Date(o.created_at),
        paymentMethod: 'COD' as any,
        paymentStatus: 'Unpaid' as any,
      }));
    },
    enabled: !!shopId,
  });
}

export function useDeliveryOrders(deliveryPersonId: string | undefined) {
  return useQuery({
    queryKey: ['delivery-orders', deliveryPersonId],
    queryFn: async () => {
      if (!deliveryPersonId) return { available: [], assigned: [] };
      return { available: [] as any[], assigned: [] as any[] };
    },
    enabled: !!deliveryPersonId,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: any }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: String(status) })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    },
  });
}

export function useAcceptDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, deliveryPersonId }: { orderId: string; deliveryPersonId: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}
