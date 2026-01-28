import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { CustomerAddress } from '@/types';

// Convert DB address to app CustomerAddress type
function dbToAddress(dbAddress: any): CustomerAddress {
  return {
    id: dbAddress.id,
    userId: dbAddress.user_id,
    label_te: dbAddress.label_te,
    label_en: dbAddress.label_en,
    receiverName: dbAddress.receiver_name,
    phone: dbAddress.phone,
    village_te: dbAddress.village_te || 'మెట్లచిట్టాపూర్',
    village_en: dbAddress.village_en || 'Metlachittapur',
    houseDetails_te: dbAddress.house_details_te,
    houseDetails_en: dbAddress.house_details_en,
    landmark_te: dbAddress.landmark_te,
    landmark_en: dbAddress.landmark_en,
    area_te: dbAddress.area_te,
    area_en: dbAddress.area_en,
    deliveryInstructions_te: dbAddress.delivery_instructions_te,
    deliveryInstructions_en: dbAddress.delivery_instructions_en,
    lat: dbAddress.lat,
    lng: dbAddress.lng,
    isDefault: dbAddress.is_default ?? false
  };
}

export function useAddresses(userId: string | undefined) {
  return useQuery({
    queryKey: ['addresses', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data.map(dbToAddress);
    },
    enabled: !!userId
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: Omit<CustomerAddress, 'id'>) => {
      // If this is set as default, unset other defaults first
      if (address.isDefault) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', address.userId);
      }

      const { data, error } = await supabase
        .from('customer_addresses')
        .insert({
          user_id: address.userId,
          label_te: address.label_te,
          label_en: address.label_en,
          receiver_name: address.receiverName,
          phone: address.phone,
          village_te: address.village_te,
          village_en: address.village_en,
          house_details_te: address.houseDetails_te,
          house_details_en: address.houseDetails_en,
          landmark_te: address.landmark_te,
          landmark_en: address.landmark_en,
          area_te: address.area_te,
          area_en: address.area_en,
          delivery_instructions_te: address.deliveryInstructions_te,
          delivery_instructions_en: address.deliveryInstructions_en,
          lat: address.lat,
          lng: address.lng,
          is_default: address.isDefault
        })
        .select()
        .single();

      if (error) throw error;
      return dbToAddress(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['addresses', variables.userId] });
    }
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId, updates }: { 
      id: string; 
      userId: string;
      updates: Partial<CustomerAddress> 
    }) => {
      // If setting as default, unset other defaults first
      if (updates.isDefault) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const dbUpdates: any = {};
      if (updates.label_te !== undefined) dbUpdates.label_te = updates.label_te;
      if (updates.label_en !== undefined) dbUpdates.label_en = updates.label_en;
      if (updates.receiverName !== undefined) dbUpdates.receiver_name = updates.receiverName;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.village_te !== undefined) dbUpdates.village_te = updates.village_te;
      if (updates.village_en !== undefined) dbUpdates.village_en = updates.village_en;
      if (updates.houseDetails_te !== undefined) dbUpdates.house_details_te = updates.houseDetails_te;
      if (updates.houseDetails_en !== undefined) dbUpdates.house_details_en = updates.houseDetails_en;
      if (updates.landmark_te !== undefined) dbUpdates.landmark_te = updates.landmark_te;
      if (updates.landmark_en !== undefined) dbUpdates.landmark_en = updates.landmark_en;
      if (updates.area_te !== undefined) dbUpdates.area_te = updates.area_te;
      if (updates.area_en !== undefined) dbUpdates.area_en = updates.area_en;
      if (updates.deliveryInstructions_te !== undefined) dbUpdates.delivery_instructions_te = updates.deliveryInstructions_te;
      if (updates.deliveryInstructions_en !== undefined) dbUpdates.delivery_instructions_en = updates.deliveryInstructions_en;
      if (updates.lat !== undefined) dbUpdates.lat = updates.lat;
      if (updates.lng !== undefined) dbUpdates.lng = updates.lng;
      if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;

      const { error } = await supabase
        .from('customer_addresses')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['addresses', variables.userId] });
    }
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    }
  });
}
