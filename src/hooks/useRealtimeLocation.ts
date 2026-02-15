import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    // Fetch latest known location
    const fetchInitialLocation = async () => {
      const { data, error } = await supabase
        .from("delivery_location_updates")
        .select("lat, lng, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLocation({
          lat: data.lat,
          lng: data.lng,
          timestamp: data.created_at,
        });
      }

      setIsLoading(false);
    };

    fetchInitialLocation();

    // Subscribe to realtime INSERT events
    channel = supabase
      .channel(`location-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_location_updates",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newData = payload.new as {
            lat: number;
            lng: number;
            created_at: string;
          };

          setLocation({
            lat: newData.lat,
            lng: newData.lng,
            timestamp: newData.created_at,
          });
        },
      )
      .subscribe();

    // Fallback polling every 5 seconds (safety net)
    pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from("delivery_location_updates")
        .select("lat, lng, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setLocation({
          lat: data.lat,
          lng: data.lng,
          timestamp: data.created_at,
        });
      }
    }, 5000);

    return () => {
      if (channel) channel.unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId]);

  return { location, isLoading };
}
