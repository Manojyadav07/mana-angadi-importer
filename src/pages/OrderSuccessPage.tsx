import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="mobile-container min-h-screen flex flex-col items-center justify-center bg-background px-6">
      {/* Success Icon */}
      <div className="w-28 h-28 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-scale-in">
        <CheckCircle className="w-16 h-16 text-success" />
      </div>

      {/* Success Message */}
      <h1 className="text-2xl font-bold text-foreground text-center animate-fade-in">
        మీ ఆర్డర్ విజయవంతంగా నమోదు అయ్యింది
      </h1>

      {orderId && (
        <p className="text-muted-foreground text-center mt-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          ఆర్డర్ #{orderId}
        </p>
      )}

      {/* Delivery Message */}
      <div className="bg-primary/10 rounded-2xl p-4 mt-6 w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <p className="text-center text-foreground">
          🛵 మన ఊరి డెలివరీ వ్యక్తి త్వరలో వస్తారు
        </p>
      </div>

      {/* Privacy Note */}
      <p className="text-muted-foreground text-sm text-center mt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        మీ ఆర్డర్ వివరాలు పూర్తిగా గోప్యంగా ఉంటాయి
      </p>

      {/* Actions */}
      <div className="w-full mt-8 space-y-3 animate-slide-up">
        <button
          onClick={() => navigate('/orders')}
          className="btn-primary w-full"
        >
          ఆర్డర్ స్థితి చూడండి
        </button>

        <button
          onClick={() => navigate('/home')}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          అంగడులకు వెళ్ళండి
        </button>
      </div>
    </div>
  );
}
