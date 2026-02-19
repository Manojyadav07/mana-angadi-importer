import { Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Order } from '@/types';

interface ETADisplayProps {
  order: Order;
  className?: string;
}

// Haversine formula to calculate distance in km
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get ETA range based on distance buckets
function getETARange(distanceKm: number): { min: number; max: number } | null {
  if (distanceKm <= 3) return { min: 15, max: 25 };
  if (distanceKm <= 6) return { min: 25, max: 40 };
  if (distanceKm <= 10) return { min: 40, max: 60 };
  if (distanceKm > 10) return { min: 60, max: 90 };
  return null;
}

export function ETADisplay({ order, className = '' }: ETADisplayProps) {
  const { language } = useLanguage();

  // Check if we have coordinates
  const hasPickupCoords = order.pickupLatSnapshot && order.pickupLngSnapshot;
  const hasDropCoords = order.dropLatSnapshot && order.dropLngSnapshot;

  if (!hasPickupCoords || !hasDropCoords) {
    return null; // Don't show if coordinates missing
  }

  const distance = calculateDistance(
    order.pickupLatSnapshot!,
    order.pickupLngSnapshot!,
    order.dropLatSnapshot!,
    order.dropLngSnapshot!
  );

  const etaRange = getETARange(distance);

  if (!etaRange) {
    return null;
  }

  const texts = {
    eta: language === 'en' ? 'Estimated time' : 'అంచనా సమయం',
    mins: language === 'en' ? 'mins' : 'నిమిషాలు',
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 ${className}`}>
      <Clock className="w-5 h-5 text-primary flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{texts.eta}</p>
        <p className="font-semibold text-foreground">
          {etaRange.min}–{etaRange.max} {texts.mins}
        </p>
      </div>
    </div>
  );
}
