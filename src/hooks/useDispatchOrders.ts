import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDispatchOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 1. Get all pending orders
      const { data: orders, error: oErr } = await supabase
        .from('orders')
        .select('id, shop_id')
        .eq('status', 'pending');

      if (oErr) throw oErr;
      if (!orders || orders.length === 0) {
        throw new Error('NO_PENDING');
      }

      // 2. Get available delivery partners
      const { data: riders, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'delivery');

      if (rErr) throw rErr;
      if (!riders || riders.length === 0) {
        throw new Error('NO_RIDERS');
      }

      let assigned = 0;

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const rider = riders[i % riders.length]; // round-robin

        // Create assignment
        const { error: aErr } = await supabase
          .from('delivery_assignments')
          .insert({
            order_id: order.id,
            delivery_partner_id: rider.user_id,
          });

        if (aErr) throw aErr;

        // Update order status to confirmed
        const { error: uErr } = await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', order.id);

        if (uErr) throw uErr;
        assigned++;
      }

      return assigned;
    },
    onSuccess: (count) => {
      toast({
        title: `${count} order(s) dispatched`,
        description: 'Orders assigned to delivery partners',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    },
    onError: (err: Error) => {
      if (err.message === 'NO_PENDING') {
        toast({ title: 'No pending orders to dispatch', variant: 'destructive' });
      } else if (err.message === 'NO_RIDERS') {
        toast({ title: 'No delivery partners available', variant: 'destructive' });
      } else {
        toast({ title: 'Dispatch failed', description: err.message, variant: 'destructive' });
      }
    },
  });
}
