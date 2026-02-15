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

    const fetchLatestLocation = async () => {
      const { data, error } = await supabase
        .from("delivery_location_updates")
        .select("*")
        .eq("order_id", orderId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLocation({
          lat: Number(data.lat),
          lng: Number(data.lng),
          timestamp: data.timestamp ?? new Date().toISOString(),
        });
      }

      setIsLoading(false);
    };

    fetchLatestLocation();

    // Subscribe to realtime updates
    const channel = supabase
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
          const newData = payload.new as any;

          setLocation({
            lat: Number(newData.lat),
            lng: Number(newData.lng),
            timestamp: newData.timestamp ?? new Date().toISOString(),
          });
        },
      )
      .subscribe();

    // Fallback polling every 5 seconds
    const pollInterval = setInterval(fetchLatestLocation, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [orderId]);

  return { location, isLoading };
}
