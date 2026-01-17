import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, Home } from 'lucide-react';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const orderId = location.state?.orderId;

  return (
    <div className="mobile-container min-h-screen flex flex-col items-center justify-center bg-background px-6">
      {/* Success Icon */}
      <div className="w-28 h-28 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-scale-in">
        <CheckCircle className="w-16 h-16 text-success" />
      </div>

      {/* Success Message */}
      <h1 className="text-2xl font-bold text-foreground text-center animate-fade-in">
        {t.orderSuccessMessage}
      </h1>

      {orderId && (
        <p className="text-muted-foreground text-center mt-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {t.orderId} #{orderId}
        </p>
      )}

      {/* Delivery Message */}
      <div className="bg-primary/10 rounded-2xl p-4 mt-6 w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <p className="text-center text-foreground">
          🛵 {t.deliveryMessage}
        </p>
      </div>

      {/* Privacy Note */}
      <p className="text-muted-foreground text-sm text-center mt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {t.privacyNote}
      </p>

      {/* Actions */}
      <div className="w-full mt-8 space-y-3 animate-slide-up">
        <button
          onClick={() => navigate('/orders')}
          className="btn-primary w-full"
        >
          {t.name === 'Name' ? 'View Order Status' : 'ఆర్డర్ స్థితి చూడండి'}
        </button>

        <button
          onClick={() => navigate('/home')}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          {t.goHome}
        </button>
      </div>
    </div>
  );
}
