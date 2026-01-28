import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface LocationUpdate {
  lat: number;
  lng: number;
  timestamp: string;
}

export function useRealtimeLocation(orderId: string | undefined) {
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    // Fetch initial location
    const fetchInitialLocation = async () => {
      const { data } = await supabase
        .from('delivery_location_updates')
        .select('lat, lng, timestamp')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setLocation({
          lat: data.lat,
          lng: data.lng,
          timestamp: data.timestamp || new Date().toISOString(),
        });
      }
      setIsLoading(false);
    };

    fetchInitialLocation();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`location-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_location_updates',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newData = payload.new as { lat: number; lng: number; timestamp: string };
          setLocation({
            lat: newData.lat,
            lng: newData.lng,
            timestamp: newData.timestamp || new Date().toISOString(),
          });
        }
      )
      .subscribe();

    // Fallback polling every 5 seconds in case realtime fails
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('delivery_location_updates')
        .select('lat, lng, timestamp')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setLocation({
          lat: data.lat,
          lng: data.lng,
          timestamp: data.timestamp || new Date().toISOString(),
        });
      }
    }, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [orderId]);

  return { location, isLoading };
}
