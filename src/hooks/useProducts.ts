import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

const sb = supabase as any;

// ─── DB → App type mapping ────────────────────────────────────────────────────

function dbToProduct(db: any): Product {
  return {
    id:       db.id,
    shopId:   db.shop_id,
    name_te:  db.name_te  ?? db.name_en ?? '',
    name_en:  db.name_en  ?? '',
    price:    Number(db.price),
    inStock:  db.is_available ?? db.is_active ?? true,
    isActive: db.is_active    ?? true,
    unit_te:  db.unit     ?? undefined,
    unit_en:  db.unit     ?? undefined,
    image:    db.image_url ?? undefined,
    category: db.category  ?? undefined,
  };
}

// ─── App → DB type mapping ────────────────────────────────────────────────────

function productToDb(product: Partial<Product> & { shopId?: string }): any {
  const db: any = {};
  if (product.shopId    !== undefined) db.shop_id      = product.shopId;
  if (product.name_te   !== undefined) db.name_te      = product.name_te;
  if (product.name_en   !== undefined) db.name_en      = product.name_en;
  if (product.price     !== undefined) db.price        = product.price;
  if (product.inStock   !== undefined) db.is_available = product.inStock;
  if (product.isActive  !== undefined) db.is_active    = product.isActive;
  if (product.unit_en   !== undefined) db.unit         = product.unit_en;
  if (product.image     !== undefined) db.image_url    = product.image;
  if (product.category  !== undefined) db.category     = product.category || null;
  return db;
}

// ─── hooks ────────────────────────────────────────────────────────────────────

export function useProducts(shopId: string | undefined) {
  return useQuery({
    queryKey: ['products', shopId],
    enabled: !!shopId,
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await sb
        .from('items')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('name_en');
      if (error) throw error;
      return (data ?? []).map(dbToProduct);
    },
  });
}

export function useMerchantProducts(shopId: string | undefined) {
  return useQuery({
    queryKey: ['merchant-products', shopId],
    enabled: !!shopId,
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await sb
        .from('items')
        .select('*')
        .eq('shop_id', shopId)
        .order('name_en');
      if (error) throw error;
      return (data ?? []).map(dbToProduct);
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: any) => {
      const db = productToDb(product);
      // ensure shop_id is set whether passed as shopId or shop_id
      if (product.shopId) db.shop_id = product.shopId;

      const { data, error } = await sb
        .from('items')
        .insert(db)
        .select()
        .single();
      if (error) throw error;
      return dbToProduct(data);
    },
    onSuccess: (_, variables: any) => {
      const shopId = variables.shopId ?? variables.shop_id;
      qc.invalidateQueries({ queryKey: ['products', shopId] });
      qc.invalidateQueries({ queryKey: ['merchant-products', shopId] });
      qc.invalidateQueries({ queryKey: ['inventory', shopId] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const db = productToDb(updates);
      const { error } = await sb
        .from('items')
        .update(db)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['merchant-products'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb
        .from('items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['merchant-products'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}