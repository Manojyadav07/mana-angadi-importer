import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface CartItemRow {
  id: string;
  item_id: string;
  shop_id: string;
  quantity: number;
  item_name: string;
  item_price: number;
  item_image_url: string | null;
  shop_name: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=60';

export function useCart() {
  const { user } = useAuth();
  const userId = user?.id;
  const [cart, setCart] = useState<CartItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!userId) { setCart([]); return; }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, item_id, shop_id, quantity')
      .eq('user_id', userId)
      .order('created_at');
    if (error || !data || data.length === 0) {
      setCart([]);
      setIsLoading(false);
      return;
    }

    // Fetch items and shops
    const itemIds = [...new Set(data.map(r => r.item_id))];
    const shopIds = [...new Set(data.map(r => r.shop_id))];

    const [itemsRes, shopsRes] = await Promise.all([
      supabase.from('items').select('id, name, price, image_url').in('id', itemIds),
      supabase.from('shops').select('id, name').in('id', shopIds),
    ]);

    const itemsMap = new Map((itemsRes.data || []).map((i: any) => [i.id, i]));
    const shopsMap = new Map((shopsRes.data || []).map((s: any) => [s.id, s]));

    const rows: CartItemRow[] = data.map((c: any) => {
      const item = itemsMap.get(c.item_id) || { name: 'Unknown', price: 0, image_url: null };
      const shop = shopsMap.get(c.shop_id) || { name: 'Shop' };
      return {
        id: c.id,
        item_id: c.item_id,
        shop_id: c.shop_id,
        quantity: c.quantity,
        item_name: item.name,
        item_price: Number(item.price),
        item_image_url: item.image_url,
        shop_name: shop.name,
      };
    });
    setCart(rows);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQuantity = useCallback(async (cartRowId: string, newQty: number) => {
    if (!userId) return;
    if (newQty <= 0) {
      await supabase.from('cart_items').delete().eq('id', cartRowId);
    } else {
      await supabase.from('cart_items').update({ quantity: newQty }).eq('id', cartRowId);
    }
    fetchCart();
  }, [userId, fetchCart]);

  const removeFromCart = useCallback(async (cartRowId: string) => {
    if (!userId) return;
    await supabase.from('cart_items').delete().eq('id', cartRowId);
    fetchCart();
  }, [userId, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!userId) return;
    await supabase.from('cart_items').delete().eq('user_id', userId);
    fetchCart();
  }, [userId, fetchCart]);

  const getCartTotal = useCallback(() => cart.reduce((s, c) => s + c.item_price * c.quantity, 0), [cart]);
  const getCartItemCount = useCallback(() => cart.reduce((s, c) => s + c.quantity, 0), [cart]);
  const cartShopId = cart.length > 0 ? cart[0].shop_id : null;

  return {
    cart,
    cartShopId,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearCartAsync: clearCart,
    getCartTotal,
    getCartItemCount,
    refetch: fetchCart,
    fallbackImage: FALLBACK_IMAGE,
  };
}
