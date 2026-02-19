import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

// Convert DB product to app Product type
function dbToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    shopId: dbProduct.shop_id,
    name_te: dbProduct.name_te,
    name_en: dbProduct.name_en,
    price: Number(dbProduct.price),
    inStock: dbProduct.in_stock ?? true,
    isActive: dbProduct.is_active ?? true,
    unit_te: dbProduct.unit,
    unit_en: dbProduct.unit,
    image: dbProduct.image_url,
    category: dbProduct.description_en || undefined
  };
}

export function useProducts(shopId: string | undefined) {
  return useQuery({
    queryKey: ['products', shopId],
    queryFn: async () => {
      if (!shopId) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('name_en');

      if (error) throw error;
      return data.map(dbToProduct);
    },
    enabled: !!shopId
  });
}

export function useMerchantProducts(shopId: string | undefined) {
  return useQuery({
    queryKey: ['merchant-products', shopId],
    queryFn: async () => {
      if (!shopId) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('name_en');

      if (error) throw error;
      return data.map(dbToProduct);
    },
    enabled: !!shopId
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          shop_id: product.shopId,
          name_te: product.name_te,
          name_en: product.name_en,
          price: product.price,
          in_stock: product.inStock,
          is_active: product.isActive,
          unit: product.unit_en,
          image_url: product.image
        })
        .select()
        .single();

      if (error) throw error;
      return dbToProduct(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', variables.shopId] });
      queryClient.invalidateQueries({ queryKey: ['merchant-products', variables.shopId] });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const dbUpdates: any = {};

      if (updates.name_te !== undefined) dbUpdates.name_te = updates.name_te;
      if (updates.name_en !== undefined) dbUpdates.name_en = updates.name_en;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.unit_en !== undefined) dbUpdates.unit = updates.unit_en;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-products'] });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-products'] });
    }
  });
}
