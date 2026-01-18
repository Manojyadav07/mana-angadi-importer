import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Truck, AlertTriangle, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export function DeliveryOnboardingPage() {
  const navigate = useNavigate();
  const { acknowledgeInsurance } = useApp();
  const { t } = useLanguage();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleContinue = () => {
    if (acknowledged) {
      acknowledgeInsurance();
      navigate('/delivery/orders');
    }
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
          <Truck className="w-12 h-12 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          {t.deliveryPartner}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {t.insuranceAcknowledgement}
        </p>

        {/* Warning Card */}
        <div className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t.insuranceMessage}
            </p>
          </div>
        </div>

        {/* Acknowledgement Checkbox */}
        <div className="w-full bg-card rounded-2xl border border-border p-4 shadow-sm">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
              className="h-6 w-6"
            />
            <span className="text-foreground font-medium">
              {t.iUnderstand}
            </span>
          </label>
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleContinue}
          disabled={!acknowledged}
          className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-5 h-5" />
          {t.continue}
        </button>
      </div>
    </div>
  );
}