import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Check } from 'lucide-react';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const orderId = location.state?.orderId;
  const etaMin = location.state?.etaMin;
  const etaMax = location.state?.etaMax;

  // Generate short display ID
  const displayId = orderId ? `#MA${String(orderId).slice(-4).toUpperCase()}` : '#MA0000';

  // Estimate delivery time
  const getDeliveryEstimate = () => {
    const now = new Date();
    const deliveryMinutes = etaMax || 45;
    const eta = new Date(now.getTime() + deliveryMinutes * 60000);
    const hours = eta.getHours();
    const minutes = eta.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

    if (language === 'en') {
      return `Today ${displayHours}:${displayMinutes} ${ampm}`;
    }
    return `ఈ రోజు ${displayHours}:${displayMinutes} ${ampm}`;
  };

  const texts = {
    heading: language === 'en' ? 'Dhanyavadalu!' : 'ధన్యవాదాలు!',
    subheading: language === 'en'
      ? 'Your order has been placed successfully.'
      : 'మీ ఆర్డర్ విజయవంతంగా ఇవ్వబడింది.',
    orderRef: language === 'en' ? 'ORDER REFERENCE' : 'ఆర్డర్ రిఫరెన్స్',
    estDelivery: language === 'en' ? 'ESTIMATED DELIVERY' : 'అంచనా డెలివరీ',
    infoMessage: language === 'en'
      ? 'A local delivery partner from your village will arrive shortly.'
      : 'మీ ఊరి నుండి ఒక స్థానిక డెలివరీ భాగస్వామి త్వరలో వస్తారు.',
    trackOrder: language === 'en' ? 'Track My Order' : 'నా ఆర్డర్‌ను ట్రాక్ చేయండి',
    backHome: language === 'en' ? 'Back to Home' : 'హోమ్‌కు తిరిగి వెళ్ళండి',
  };

  return (
    <div className="screen-shell min-h-screen bg-mana-cream flex flex-col items-center px-6 pt-14 pb-10">
      {/* 1. Top Branding */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-mana-charcoal/40 font-sans">MANA</p>
        <p className="text-xs uppercase tracking-[0.3em] text-mana-charcoal/40 font-sans -mt-0.5">ANGADI</p>
      </div>

      {/* 2. Success Icon */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
        <Check className="w-10 h-10 text-primary" strokeWidth={2.5} />
      </div>

      {/* 3. Main Heading */}
      <h1 className="font-display text-3xl font-semibold text-mana-charcoal text-center mb-2">
        {texts.heading}
      </h1>
      <p className="text-mana-charcoal/60 text-center text-sm mb-8">
        {texts.subheading}
      </p>

      {/* 4. Order Information Card */}
      <div className="w-full bg-card rounded-xl shadow-sm p-5 mb-6">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mana-charcoal/50 mb-1">{texts.orderRef}</p>
          <p className="font-bold text-mana-charcoal text-lg">{displayId}</p>
        </div>
        <div className="border-t border-mana-charcoal/5 my-3" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-mana-charcoal/50 mb-1">{texts.estDelivery}</p>
          <p className="font-bold text-mana-charcoal text-lg">{getDeliveryEstimate()}</p>
        </div>
      </div>

      {/* 5. Informational Message */}
      <p className="text-mana-charcoal/50 text-sm text-center italic mb-10 px-4">
        {texts.infoMessage}
      </p>

      {/* 6. Primary Action */}
      <button
        onClick={() => navigate('/orders')}
        className="btn-primary-pill w-full py-4 text-base font-semibold active:scale-[0.98] transition-transform"
      >
        {texts.trackOrder}
      </button>

      {/* 7. Secondary Action */}
      <button
        onClick={() => navigate('/home')}
        className="mt-4 text-mana-charcoal/50 text-sm font-sans hover:text-mana-charcoal transition-colors"
      >
        {texts.backHome}
      </button>
    </div>
  );
}
