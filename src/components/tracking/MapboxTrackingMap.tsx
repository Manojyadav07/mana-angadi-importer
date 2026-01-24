import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import { useLanguage } from '@/context/LanguageContext';
import { Navigation, RefreshCw, Store, Home } from 'lucide-react';

// Get Mapbox token from env
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

interface MapboxTrackingMapProps {
  orderId: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
}

const BIKE_EMOJI = '🏍️';

export function MapboxTrackingMap({
  orderId,
  pickupLat = 18.8305,
  pickupLng = 78.6098,
  dropLat = 18.7892,
  dropLng = 78.5723,
}: MapboxTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const deliveryMarker = useRef<mapboxgl.Marker | null>(null);
  const { location, isLoading } = useRealtimeLocation(orderId);
  const { t, language } = useLanguage();
  const [mapError, setMapError] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [(pickupLng + dropLng) / 2, (pickupLat + dropLat) / 2],
        zoom: 13,
        attributionControl: false,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Pickup marker (green - shop)
      const pickupEl = document.createElement('div');
      pickupEl.className = 'w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white';
      pickupEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>';

      new mapboxgl.Marker({ element: pickupEl })
        .setLngLat([pickupLng, pickupLat])
        .setPopup(new mapboxgl.Popup().setHTML(`<b>${language === 'te' ? 'పికప్' : 'Pickup'}</b>`))
        .addTo(map.current);

      // Drop marker (red - customer)
      const dropEl = document.createElement('div');
      dropEl.className = 'w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white';
      dropEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>';

      new mapboxgl.Marker({ element: dropEl })
        .setLngLat([dropLng, dropLat])
        .setPopup(new mapboxgl.Popup().setHTML(`<b>${language === 'te' ? 'డ్రాప్' : 'Dropoff'}</b>`))
        .addTo(map.current);

      // Delivery partner marker (bike emoji)
      const deliveryEl = document.createElement('div');
      deliveryEl.className = 'text-2xl';
      deliveryEl.innerHTML = BIKE_EMOJI;
      deliveryMarker.current = new mapboxgl.Marker({ element: deliveryEl });

      // Fit bounds to show all markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([pickupLng, pickupLat]);
      bounds.extend([dropLng, dropLat]);
      map.current.fitBounds(bounds, { padding: 50 });

    } catch (error) {
      console.error('Mapbox init error:', error);
      setMapError(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [pickupLat, pickupLng, dropLat, dropLng, language]);

  // Update delivery marker when location changes
  useEffect(() => {
    if (!map.current || !deliveryMarker.current || !location) return;

    deliveryMarker.current
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);

    // Optionally fly to the delivery partner
    map.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 15,
      duration: 1000,
    });
  }, [location]);

  const formatLastUpdated = (timestamp: string) => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)}m ago`;
    }
    return new Date(timestamp).toLocaleTimeString();
  };

  // Calculate delivery progress percentage
  const getDeliveryProgress = () => {
    if (!location) return 0;
    
    const totalDist = Math.sqrt(
      Math.pow(dropLat - pickupLat, 2) + Math.pow(dropLng - pickupLng, 2)
    );
    const currentDist = Math.sqrt(
      Math.pow(dropLat - location.lat, 2) + Math.pow(dropLng - location.lng, 2)
    );
    
    const progress = Math.max(0, Math.min(100, ((totalDist - currentDist) / totalDist) * 100));
    return Math.round(progress);
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <p className="text-center text-muted-foreground text-sm">
          {language === 'te' ? 'మ్యాప్ లోడ్ కాలేదు' : 'Map not available'}
        </p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <div className="h-32 rounded-xl bg-muted flex flex-col items-center justify-center">
          <div className="text-3xl mb-2">{BIKE_EMOJI}</div>
          <p className="text-sm text-foreground font-medium">{t.deliveryOnTheWay}</p>
          {location && (
            <p className="text-xs text-muted-foreground mt-1">
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          {t.liveTracking}
        </h3>
        {location && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            {t.lastUpdated}: {formatLastUpdated(location.timestamp)}
          </span>
        )}
      </div>

      {/* Status message with animated indicator */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-primary flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {t.deliveryOnTheWay}
        </p>
        {location && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            {getDeliveryProgress()}% {BIKE_EMOJI}
          </span>
        )}
      </div>

      {/* Mapbox Container */}
      <div 
        ref={mapContainer} 
        className="h-48 rounded-xl overflow-hidden border border-border"
      />

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <Store className="w-3 h-3" />
          {language === 'te' ? 'షాప్' : 'Shop'}
        </span>
        <span className="text-lg">{BIKE_EMOJI}</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <Home className="w-3 h-3" />
          {language === 'te' ? 'మీ లొకేషన్' : 'Your Location'}
        </span>
      </div>

      {/* Delivery Partner Location */}
      {isLoading ? (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <div className="animate-pulse flex items-center gap-2">
            <span className="text-lg">{BIKE_EMOJI}</span>
            <span>{language === 'te' ? 'లొకేషన్ లోడ్ అవుతోంది...' : 'Loading location...'}</span>
          </div>
        </div>
      ) : location ? (
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
          <span className="flex items-center gap-1">
            <span className="text-base">{BIKE_EMOJI}</span>
            📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </span>
          <span>{formatLastUpdated(location.timestamp)}</span>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <div className="animate-pulse flex items-center gap-2">
            <span className="text-lg">{BIKE_EMOJI}</span>
            <span>{t.deliveryOnTheWay}...</span>
          </div>
        </div>
      )}
    </div>
  );
}
