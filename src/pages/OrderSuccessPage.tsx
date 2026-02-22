import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Check } from 'lucide-react';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const orderIds: string[] = location.state?.orderIds || [];
  const shopNames: string[] = location.state?.shopNames || [];
  const totals: number[] = location.state?.totals || [];

  const en = language === 'en';

  return (
    <div className="screen-shell min-h-screen bg-background flex flex-col items-center px-6 pt-14 pb-10">
      {/* Branding */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 font-sans">MANA</p>
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 font-sans -mt-0.5">ANGADI</p>
      </div>

      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
        <Check className="w-10 h-10 text-primary" strokeWidth={2.5} />
      </div>

      <h1 className="font-display text-3xl font-semibold text-foreground text-center mb-2">
        {en ? 'Dhanyavadalu!' : 'ధన్యవాదాలు!'}
      </h1>
      <p className="text-foreground/60 text-center text-sm mb-8">
        {en ? 'Your order has been placed successfully.' : 'మీ ఆర్డర్ విజయవంతంగా ఇవ్వబడింది.'}
      </p>

      {/* Order summary cards */}
      {orderIds.length > 0 && (
        <div className="w-full space-y-3 mb-8">
          {orderIds.map((id, i) => (
            <div key={id} className="bg-card rounded-xl shadow-sm p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-foreground text-sm">{shopNames[i] || 'Shop'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">#{id.slice(0, 8).toUpperCase()}</p>
              </div>
              <p className="font-bold text-foreground">₹{totals[i]}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      <button
        onClick={() => navigate('/orders')}
        className="w-full bg-primary text-primary-foreground font-semibold text-base py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
      >
        {en ? 'View My Orders' : 'నా ఆర్డర్లు చూడండి'}
      </button>

      <button
        onClick={() => navigate('/home')}
        className="mt-4 text-foreground/50 text-sm font-sans hover:text-foreground transition-colors"
      >
        {en ? 'Continue Shopping' : 'షాపింగ్ కొనసాగించండి'}
      </button>
    </div>
  );
}
