import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, RefreshCw, Navigation, Store, Home } from 'lucide-react';
import { LocationUpdate, METPALLY_COORDS, METLACHITTAPUR_COORDS } from '@/types';

interface LiveTrackingCardProps {
  orderId: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
}

// Bike emoji for the marker
const BIKE_ICON = '🏍️';

export function LiveTrackingCard({ 
  orderId, 
  pickupLat, 
  pickupLng, 
  dropLat, 
  dropLng 
}: LiveTrackingCardProps) {
  const { getLatestLocation, locationUpdates } = useApp();
  const { t } = useLanguage();
  const [location, setLocation] = useState<LocationUpdate | undefined>(undefined);
  const [mapError, setMapError] = useState(false);

  // Use provided coordinates or defaults
  const pickup = useMemo(() => ({
    lat: pickupLat ?? METPALLY_COORDS.lat,
    lng: pickupLng ?? METPALLY_COORDS.lng,
  }), [pickupLat, pickupLng]);

  const drop = useMemo(() => ({
    lat: dropLat ?? METLACHITTAPUR_COORDS.lat,
    lng: dropLng ?? METLACHITTAPUR_COORDS.lng,
  }), [dropLat, dropLng]);

  // Poll for location updates every 10 seconds
  useEffect(() => {
    const updateLocationState = () => {
      const latest = getLatestLocation(orderId);
      if (latest) {
        setLocation(latest);
      }
    };

    // Initial update
    updateLocationState();

    // Poll every 10 seconds
    const interval = setInterval(updateLocationState, 10000);
    return () => clearInterval(interval);
  }, [orderId, getLatestLocation, locationUpdates]);

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)}m ago`;
    }
    return new Date(date).toLocaleTimeString();
  };

  // Generate static map URL with pickup, drop, and delivery markers
  // Using OpenStreetMap static map service with route line
  const getMapImageUrl = () => {
    // Calculate bounds to include all points
    const points = [pickup, drop];
    if (location) {
      points.push({ lat: location.lat, lng: location.lng });
    }
    
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    // Calculate zoom level based on distance
    const latDiff = Math.max(...lats) - Math.min(...lats);
    const lngDiff = Math.max(...lngs) - Math.min(...lngs);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    // Approximate zoom level
    let zoom = 14;
    if (maxDiff > 0.1) zoom = 11;
    else if (maxDiff > 0.05) zoom = 12;
    else if (maxDiff > 0.02) zoom = 13;
    else if (maxDiff > 0.01) zoom = 14;
    else zoom = 15;

    // Create markers string
    // Pickup (green), Drop (red), Delivery (blue)
    let markers = `${pickup.lat},${pickup.lng},green|${drop.lat},${drop.lng},red`;
    if (location) {
      markers += `|${location.lat},${location.lng},blue`;
    }

    return `https://staticmap.openstreetmap.de/staticmap.php?center=${centerLat},${centerLng}&zoom=${zoom}&size=400x220&markers=${markers}`;
  };

  // Calculate delivery progress percentage
  const getDeliveryProgress = () => {
    if (!location) return 0;
    
    const totalDist = Math.sqrt(
      Math.pow(drop.lat - pickup.lat, 2) + Math.pow(drop.lng - pickup.lng, 2)
    );
    const currentDist = Math.sqrt(
      Math.pow(drop.lat - location.lat, 2) + Math.pow(drop.lng - location.lng, 2)
    );
    
    const progress = Math.max(0, Math.min(100, ((totalDist - currentDist) / totalDist) * 100));
    return Math.round(progress);
  };

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
            {t.lastUpdated}: {formatLastUpdated(location.createdAt)}
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
            {getDeliveryProgress()}% {BIKE_ICON}
          </span>
        )}
      </div>

      {/* Map Section */}
      <div className="space-y-3">
        {/* Static Map Image with markers */}
        {!mapError ? (
          <div className="h-44 rounded-xl overflow-hidden border border-border bg-muted relative">
            <img 
              src={getMapImageUrl()}
              alt="Delivery tracking map"
              className="w-full h-full object-cover"
              onError={() => setMapError(true)}
            />
            
            {/* Legend overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1.5 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <Store className="w-3 h-3" /> Metpally
              </span>
              <span className="flex items-center gap-1">
                <span className="text-base">{BIKE_ICON}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <Home className="w-3 h-3" /> Metlachittapur
              </span>
            </div>
          </div>
        ) : (
          // Fallback UI when map fails
          <div className="h-32 rounded-xl bg-muted flex flex-col items-center justify-center border border-border">
            <div className="text-3xl mb-2">{BIKE_ICON}</div>
            <p className="text-sm text-foreground font-medium">{t.deliveryOnTheWay}</p>
            {location && (
              <p className="text-xs text-muted-foreground mt-1">
                📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>
        )}
        
        {/* Route Info */}
        <div className="grid grid-cols-2 gap-2">
          {/* Pickup */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Store className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs">
              <p className="text-muted-foreground">Pickup</p>
              <p className="font-medium text-foreground">Metpally</p>
            </div>
          </div>
          
          {/* Drop */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <Home className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs">
              <p className="text-muted-foreground">Drop</p>
              <p className="font-medium text-foreground">Metlachittapur</p>
            </div>
          </div>
        </div>

        {/* Delivery Partner Location */}
        {location ? (
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
            <span className="flex items-center gap-1">
              <span className="text-base">{BIKE_ICON}</span>
              <MapPin className="w-3 h-3" />
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
            <span>{formatLastUpdated(location.createdAt)}</span>
          </div>
        ) : (
          // Waiting for location
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <div className="animate-pulse flex items-center gap-2">
              <span className="text-lg">{BIKE_ICON}</span>
              <span>{t.deliveryOnTheWay}...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}