import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shop, ShopType } from '@/types';

const sb = supabase as any;

// ── DB → App ──────────────────────────────────────────────────────────────────

function dbToShop(dbShop: any): Shop {
  const typeLabels: Record<string, { te: string; en: string }> = {
    kirana:     { te: 'కిరాణా',  en: 'Grocery'    },
    restaurant: { te: 'హోటల్',   en: 'Restaurant' },
    medical:    { te: 'మెడికల్', en: 'Medical'    },
  };

  return {
    id:               dbShop.id,
    ownerId:          dbShop.owner_id,
    name_te:          dbShop.name_te,
    name_en:          dbShop.name_en,
    type:             dbShop.type as ShopType,
    type_te:          typeLabels[dbShop.type]?.te as any || 'కిరాణా',
    type_en:          typeLabels[dbShop.type]?.en as any || 'Grocery',
    isOpen:           dbShop.is_open         ?? true,
    isActive:         dbShop.is_active       ?? true,
    address_te:       dbShop.address_te,
    address_en:       dbShop.address_en,
    pickupLat:        dbShop.pickup_lat,
    pickupLng:        dbShop.pickup_lng,
    upiVpa:           dbShop.upi_vpa         ?? '',
    upiPayeeName:     dbShop.upi_payee_name  ?? '',
    villageId:        dbShop.village_id,
    // profile fields
    phone:            dbShop.phone           ?? '',
    address:          dbShop.address         ?? '',
    logo_url:         dbShop.logo_url        ?? '',
    working_hours:    dbShop.working_hours   ?? null,
    // order settings
    minOrderAmount:   dbShop.min_order_amount  ?? 0,
    prepTimeMinutes:  dbShop.prep_time_minutes ?? 30,
    acceptsCod:       dbShop.accepts_cod       ?? true,
    acceptsUpi:       dbShop.accepts_upi       ?? true,
    tempClosureReason: dbShop.temp_closure_reason ?? '',
  };
}

// ── hooks ─────────────────────────────────────────────────────────────────────

export function useShops(townId?: string | null) {
  return useQuery({
    queryKey: ['shops', townId],
    queryFn: async () => {
      let query = sb.from('shops').select('*').order('name');
      if (townId) query = query.eq('town_id', townId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(dbToShop);
    },
  });
}

export function useShop(shopId: string | undefined) {
  return useQuery({
    queryKey: ['shop', shopId],
    enabled: !!shopId,
    queryFn: async () => {
      if (!shopId) return null;
      const { data, error } = await sb
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .maybeSingle();
      if (error) throw error;
      return data ? dbToShop(data) : null;
    },
  });
}

export function useMerchantShop(ownerId: string | undefined) {
  return useQuery({
    queryKey: ['merchant-shop', ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      if (!ownerId) return null;
      const { data, error } = await sb
        .from('shops')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();
      if (error) throw error;
      return data ? dbToShop(data) : null;
    },
  });
}

export function useUpdateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const db: any = {};

      // core fields
      if (updates.name_te      !== undefined) db.name_te       = updates.name_te;
      if (updates.name_en      !== undefined) db.name_en       = updates.name_en;
      if (updates.type         !== undefined) db.type          = updates.type;
      if (updates.isOpen       !== undefined) db.is_open       = updates.isOpen;
      if (updates.isActive     !== undefined) db.is_active     = updates.isActive;
      if (updates.pickupLat    !== undefined) db.pickup_lat    = updates.pickupLat;
      if (updates.pickupLng    !== undefined) db.pickup_lng    = updates.pickupLng;
      if (updates.upiVpa       !== undefined) db.upi_vpa       = updates.upiVpa;
      if (updates.upiPayeeName !== undefined) db.upi_payee_name = updates.upiPayeeName;
      if (updates.villageId    !== undefined) db.village_id    = updates.villageId;

      // profile fields
      if (updates.phone         !== undefined) db.phone         = updates.phone;
      if (updates.address       !== undefined) db.address       = updates.address;
      if (updates.logo_url      !== undefined) db.logo_url      = updates.logo_url;
      if (updates.working_hours !== undefined) db.working_hours = updates.working_hours;

      // order settings
      if (updates.minOrderAmount    !== undefined) db.min_order_amount    = updates.minOrderAmount;
      if (updates.prepTimeMinutes   !== undefined) db.prep_time_minutes   = updates.prepTimeMinutes;
      if (updates.acceptsCod        !== undefined) db.accepts_cod         = updates.acceptsCod;
      if (updates.acceptsUpi        !== undefined) db.accepts_upi         = updates.acceptsUpi;
      if (updates.tempClosureReason !== undefined) db.temp_closure_reason = updates.tempClosureReason;

      const { error } = await sb.from('shops').update(db).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-shop'] });
    },
  });
}

export function useCreateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shop: any) => {
      const { data, error } = await sb
        .from('shops')
        .insert({
          owner_id:     shop.ownerId,
          name_te:      shop.name_te,
          name_en:      shop.name_en,
          type:         shop.type,
          is_open:      shop.isOpen      ?? true,
          is_active:    shop.isActive    ?? true,
          pickup_lat:   shop.pickupLat,
          pickup_lng:   shop.pickupLng,
          upi_vpa:      shop.upiVpa,
          upi_payee_name: shop.upiPayeeName,
          village_id:   shop.villageId,
        })
        .select()
        .single();
      if (error) throw error;
      return dbToShop(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}