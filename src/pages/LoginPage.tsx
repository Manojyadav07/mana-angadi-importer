import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Store, ArrowRight, Loader2, ShoppingBag, Briefcase } from 'lucide-react';

const WELCOME_SHOWN_KEY = 'mana-angadi-welcome-shown';

type LoginRole = 'customer' | 'merchant';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const { t } = useLanguage();
  
  const [phone, setPhone] = useState('9876543210');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>('customer');

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeDismiss = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    setShowWelcome(false);
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (selectedRole === 'merchant') {
      login(phone, 'Merchant User', 'merchant', ['shop_1', 'shop_2', 'shop_3']);
      navigate('/merchant/orders');
    } else {
      login(phone, 'Test User', 'customer');
      navigate('/home');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
  };

  if (showWelcome) {
    return <WelcomeScreen onContinue={handleWelcomeDismiss} />;
  }

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      {/* Header Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
          <Store className="w-12 h-12 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground text-center animate-fade-in">
          {t.welcome}
        </h1>
        <p className="text-muted-foreground text-center mt-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {t.enterMobileNumber}
        </p>
      </div>

      {/* Form Section */}
      <div className="px-6 pb-8 space-y-4 animate-slide-up">
        {/* Role Selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {t.loginAs || 'Login as'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'customer'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'customer' ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <ShoppingBag className={`w-6 h-6 ${
                  selectedRole === 'customer' ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
              <span className={`text-sm font-medium ${
                selectedRole === 'customer' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {t.customer || 'Customer'}
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedRole('merchant')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'merchant'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'merchant' ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <Briefcase className={`w-6 h-6 ${
                  selectedRole === 'merchant' ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
              <span className={`text-sm font-medium ${
                selectedRole === 'merchant' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {t.merchant || 'Merchant'}
              </span>
            </button>
          </div>
        </div>

        {/* Phone Input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={handlePhoneChange}
            placeholder={t.mobileNumber}
            className="input-village pl-14"
          />
        </div>

        <button
          onClick={handleQuickLogin}
          disabled={isLoading}
          className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {t.continue}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-muted-foreground text-xs text-center">
          {t.testingMode}
        </p>
      </div>

      {/* Village Badge */}
      <div className="px-6 pb-8 text-center">
        <span className="trust-badge">
          {t.villageBadge}
        </span>
      </div>
    </div>
  );
}
