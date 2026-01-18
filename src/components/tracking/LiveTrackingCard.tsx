import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, RefreshCw, Navigation } from 'lucide-react';
import { LocationUpdate } from '@/types';

// Lazy load map to handle potential failures gracefully
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LiveTrackingCardProps {
  orderId: string;
}

// Component to update map view when location changes
function MapUpdater({ location }: { location: LocationUpdate }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([location.lat, location.lng], 15);
  }, [map, location.lat, location.lng]);
  
  return null;
}

export function LiveTrackingCard({ orderId }: LiveTrackingCardProps) {
  const { getLatestLocation, locationUpdates } = useApp();
  const { t } = useLanguage();
  const [location, setLocation] = useState<LocationUpdate | undefined>(undefined);
  const [mapError, setMapError] = useState(false);
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

      {/* Map or Fallback */}
      {location ? (
        !mapError ? (
          <div className="h-48 rounded-xl overflow-hidden border border-border">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
              // @ts-ignore - onError is valid
              onError={() => setMapError(true)}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[location.lat, location.lng]} icon={deliveryIcon} />
              <MapUpdater location={location} />
            </MapContainer>
          </div>
        ) : (
          // Fallback UI when map fails
          <div className="h-32 rounded-xl bg-muted flex flex-col items-center justify-center border border-border">
            <MapPin className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-foreground font-medium">{t.liveTracking}</p>
            <p className="text-xs text-muted-foreground mt-1">
              📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t.lastUpdated}: {formatLastUpdated(location.createdAt)}
            </p>
          </div>
        )
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
