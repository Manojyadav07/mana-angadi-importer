import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';

export interface DBCartItem {
  id: string;
  product_id: string;
  shop_id: string;
  quantity: number;
  product: Product;
}

interface RawCartRow {
  id: string;
  product_id: string;
  shop_id: string;
  quantity: number;
  products: {
    id: string;
    shop_id: string;
    name_te: string;
    name_en: string;
    price: number;
    in_stock: boolean | null;
    is_active: boolean | null;
    unit: string | null;
    image_url: string | null;
  };
}

function rowToCartItem(row: RawCartRow): DBCartItem {
  const p = row.products;
  return {
    id: row.id,
    product_id: row.product_id,
    shop_id: row.shop_id,
    quantity: row.quantity,
    product: {
      id: p.id,
      shopId: p.shop_id,
      name_te: p.name_te,
      name_en: p.name_en,
      price: Number(p.price),
      inStock: p.in_stock ?? true,
      isActive: p.is_active ?? true,
      unit_te: p.unit ?? undefined,
      unit_en: p.unit ?? undefined,
      image: p.image_url ?? undefined,
    },
  };
}

export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const cartQuery = useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select('id, product_id, shop_id, quantity, products(id, shop_id, name_te, name_en, price, in_stock, is_active, unit, image_url)')
        .eq('user_id', userId)
        .order('created_at');

      if (error) throw error;
      return (data as unknown as RawCartRow[]).map(rowToCartItem);
    },
    enabled: !!userId,
  });

  const cart = cartQuery.data ?? [];
  const cartShopId = cart.length > 0 ? cart[0].shop_id : null;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart', userId] });

  // Add to cart (upsert quantity +1)
  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      if (!userId) throw new Error('Not authenticated');

      // Check if switching shops
      if (cartShopId && cartShopId !== product.shopId) {
        // Use the clear_cart_and_add function
        const { error } = await supabase.rpc('clear_cart_and_add', {
          _user_id: userId,
          _product_id: product.id,
          _shop_id: product.shopId,
          _quantity: 1,
        });
        if (error) throw error;
        return;
      }

      // Upsert: insert or increment quantity
      const existing = cart.find(c => c.product_id === product.id);
      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: product.id,
            shop_id: product.shopId,
            quantity: 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  // Update quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!userId) throw new Error('Not authenticated');

      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', userId)
          .eq('product_id', productId);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  // Remove from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  // Computed values
  const getCartTotal = () => cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const getCartItemCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  // Convenience wrappers matching old API
  const addToCart = (product: Product) => addToCartMutation.mutate(product);
  const updateQuantity = (productId: string, quantity: number) =>
    updateQuantityMutation.mutate({ productId, quantity });
  const removeFromCart = (productId: string) => removeFromCartMutation.mutate(productId);
  const clearCart = () => clearCartMutation.mutate();

  return {
    cart,
    cartShopId,
    isLoading: cartQuery.isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCartAsync: clearCartMutation.mutateAsync,
    getCartTotal,
    getCartItemCount,
  };
}
