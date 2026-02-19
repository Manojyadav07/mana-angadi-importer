import { useLanguage } from '@/context/LanguageContext';
import { ShopType, DEFAULT_DELIVERY_FEE_RULES } from '@/types';
import { Info, X, Truck, Package, Gift } from 'lucide-react';
import { useState } from 'react';

interface DeliveryFeeCardProps {
  subtotal: number;
  deliveryFee: number;
  distanceKm?: number;
  etaMin?: number;
  etaMax?: number;
  shopType: ShopType;
  freeDelivery: boolean;
}

export function DeliveryFeeCard({
  subtotal,
  deliveryFee,
  distanceKm,
  etaMin,
  etaMax,
  shopType,
  freeDelivery,
}: DeliveryFeeCardProps) {
  const { language } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);

  const labels = {
    deliveryFee: language === 'en' ? 'Delivery Fee' : 'డెలివరీ ఫీ',
    free: language === 'en' ? 'FREE' : 'ఉచితం',
    distance: language === 'en' ? 'Distance' : 'దూరం',
    km: language === 'en' ? 'km' : 'కి.మీ',
    eta: language === 'en' ? 'ETA' : 'అంచనా సమయం',
    mins: language === 'en' ? 'mins' : 'నిమిషాలు',
    etaVaries: language === 'en' ? 'ETA varies' : 'సమయం మారవచ్చు',
    whyThisFee: language === 'en' ? 'Why this fee?' : 'ఈ ఫీ ఎందుకు?',
    feeExplanation: language === 'en' ? 'Fee Breakdown' : 'ఫీ వివరాలు',
    baseFee: language === 'en' ? 'Base fee' : 'బేస్ ఫీ',
    distanceFee: language === 'en' ? 'Distance fee' : 'దూరం ఫీ',
    perKm: language === 'en' ? 'per km' : 'కి.మీ కి',
    maxCap: language === 'en' ? 'Maximum cap applied' : 'గరిష్ట పరిమితి వర్తించింది',
    freeThreshold: language === 'en' 
      ? `Free delivery on orders above ₹${DEFAULT_DELIVERY_FEE_RULES.freeDeliveryMinOrder}` 
      : `₹${DEFAULT_DELIVERY_FEE_RULES.freeDeliveryMinOrder} పైన ఆర్డర్లకు ఉచిత డెలివరీ`,
    shopTypeLabel: {
      kirana: language === 'en' ? 'Grocery' : 'కిరాణా',
      restaurant: language === 'en' ? 'Restaurant' : 'హోటల్',
      medical: language === 'en' ? 'Medical' : 'మెడికల్',
    }[shopType],
  };

  const getBaseFee = () => {
    switch (shopType) {
      case 'kirana': return DEFAULT_DELIVERY_FEE_RULES.baseFeeKirana;
      case 'restaurant': return DEFAULT_DELIVERY_FEE_RULES.baseFeeRestaurant;
      case 'medical': return DEFAULT_DELIVERY_FEE_RULES.baseFeeMedical;
      default: return DEFAULT_DELIVERY_FEE_RULES.baseFeeKirana;
    }
  };

  return (
    <>
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">{labels.deliveryFee}</span>
          </div>
          {freeDelivery ? (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center gap-1">
              <Gift className="w-4 h-4" />
              {labels.free}
            </span>
          ) : (
            <span className="font-semibold text-foreground">₹{deliveryFee}</span>
          )}
        </div>

        {/* Distance & ETA */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {distanceKm !== undefined && (
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              <span>{distanceKm.toFixed(1)} {labels.km}</span>
            </div>
          )}
          {etaMin && etaMax ? (
            <div className="flex items-center gap-1">
              <span>{labels.eta}: {etaMin}–{etaMax} {labels.mins}</span>
            </div>
          ) : (
            <span className="text-xs">{labels.etaVaries}</span>
          )}
        </div>

        {/* Why this fee link */}
        {!freeDelivery && (
          <button
            onClick={() => setShowDetails(true)}
            className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline"
          >
            <Info className="w-4 h-4" />
            {labels.whyThisFee}
          </button>
        )}

        {/* Free delivery hint */}
        {!freeDelivery && DEFAULT_DELIVERY_FEE_RULES.freeDeliveryMinOrder && (
          <p className="mt-2 text-xs text-muted-foreground">
            {labels.freeThreshold}
          </p>
        )}
      </div>

      {/* Fee Explanation Bottom Sheet */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-lg text-foreground">{labels.feeExplanation}</h3>
              <button onClick={() => setShowDetails(false)} className="p-2 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Base Fee */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">{labels.baseFee}</p>
                  <p className="text-sm text-muted-foreground">{labels.shopTypeLabel}</p>
                </div>
                <span className="font-semibold text-foreground">₹{getBaseFee()}</span>
              </div>

              {/* Distance Fee */}
              {distanceKm !== undefined && DEFAULT_DELIVERY_FEE_RULES.perKmFee && (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{labels.distanceFee}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{DEFAULT_DELIVERY_FEE_RULES.perKmFee} {labels.perKm} × {Math.ceil(distanceKm)} {labels.km}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">
                    ₹{Math.ceil(distanceKm) * DEFAULT_DELIVERY_FEE_RULES.perKmFee}
                  </span>
                </div>
              )}

              {/* Max Cap */}
              {deliveryFee === DEFAULT_DELIVERY_FEE_RULES.maxFeeCap && (
                <div className="p-3 rounded-xl bg-primary/10 text-primary text-sm">
                  {labels.maxCap}: ₹{DEFAULT_DELIVERY_FEE_RULES.maxFeeCap}
                </div>
              )}

              {/* Total */}
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="font-semibold text-foreground">{labels.deliveryFee}</span>
                <span className="font-bold text-primary text-lg">₹{deliveryFee}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
