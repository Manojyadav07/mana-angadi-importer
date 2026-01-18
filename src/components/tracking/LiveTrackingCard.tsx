import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, RefreshCw, Navigation } from 'lucide-react';
import { LocationUpdate } from '@/types';

interface LiveTrackingCardProps {
  orderId: string;
}

export function LiveTrackingCard({ orderId }: LiveTrackingCardProps) {
  const { getLatestLocation, locationUpdates } = useApp();
  const { t } = useLanguage();
  const [location, setLocation] = useState<LocationUpdate | undefined>(undefined);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Poll for location updates every 10 seconds
  useEffect(() => {
    const updateLocation = () => {
      const latest = getLatestLocation(orderId);
      if (latest) {
        setLocation(latest);
        setLastRefresh(new Date());
      }
    };

    // Initial update
    updateLocation();

    // Poll every 10 seconds
    const interval = setInterval(updateLocation, 10000);
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

  // Generate OpenStreetMap static image URL
  const getMapImageUrl = (lat: number, lng: number) => {
    // Using OSM static map service (free, no API key required)
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=400x200&markers=${lat},${lng},lightblue`;
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

      {/* Status message */}
      <p className="text-sm text-primary mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        {t.deliveryOnTheWay}
      </p>

      {/* Map Image or Fallback */}
      {location ? (
        <div className="space-y-2">
          {/* Static Map Image */}
          <div className="h-40 rounded-xl overflow-hidden border border-border bg-muted">
            <img 
              src={getMapImageUrl(location.lat, location.lng)}
              alt="Delivery location map"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide the image if it fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          {/* Coordinates and last updated */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
            <span>{formatLastUpdated(location.createdAt)}</span>
          </div>
        </div>
      ) : (
        // Waiting for location
        <div className="h-32 rounded-xl bg-muted flex flex-col items-center justify-center border border-border">
          <div className="animate-pulse flex flex-col items-center">
            <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t.deliveryOnTheWay}</p>
          </div>
        </div>
      )}
    </div>
  );
}
