import { MapboxTrackingMap } from './MapboxTrackingMap';
import { METPALLY_COORDS, METLACHITTAPUR_COORDS } from '@/types';

interface LiveTrackingCardProps {
  orderId: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
}

// This component now delegates to MapboxTrackingMap
export function LiveTrackingCard({ 
  orderId, 
  pickupLat, 
  pickupLng, 
  dropLat, 
  dropLng 
}: LiveTrackingCardProps) {
  return (
    <MapboxTrackingMap
      orderId={orderId}
      pickupLat={pickupLat ?? METPALLY_COORDS.lat}
      pickupLng={pickupLng ?? METPALLY_COORDS.lng}
      dropLat={dropLat ?? METLACHITTAPUR_COORDS.lat}
      dropLng={dropLng ?? METLACHITTAPUR_COORDS.lng}
    />
  );
}
