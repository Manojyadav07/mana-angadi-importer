import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Store, ArrowRight, Loader2 } from 'lucide-react';

type LoginStep = 'phone' | 'otp' | 'name';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handlePhoneSubmit = async () => {
    setError('');
    
    if (!validatePhone(phone)) {
      setError('దయచేసి సరైన మొబైల్ నెంబర్ నమోదు చేయండి');
      return;
    }

    setIsLoading(true);
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('otp');
  };

  const handleOtpSubmit = async () => {
    setError('');

    if (otp.length !== 4) {
      setError('దయచేసి 4 అంకెల OTP నమోదు చేయండి');
      return;
    }

    setIsLoading(true);
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('name');
  };

  const handleNameSubmit = () => {
    login(phone, name.trim() || undefined);
    navigate('/home');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    setError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(value);
    setError('');
  };

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
          మన అంగడికి స్వాగతం
        </h1>
        <p className="text-muted-foreground text-center mt-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {step === 'phone' && 'మీ మొబైల్ నెంబర్ నమోదు చేయండి'}
          {step === 'otp' && 'OTP నమోదు చేయండి'}
          {step === 'name' && 'మీ పేరు చెప్పండి (ఐచ్ఛికం)'}
        </p>
      </div>

      {/* Form Section */}
      <div className="px-6 pb-12 space-y-4 animate-slide-up">
        {/* Phone Input Step */}
        {step === 'phone' && (
          <>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="మొబైల్ నెంబర్"
                className="input-village pl-14"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-destructive text-sm text-center animate-fade-in">
                {error}
              </p>
            )}

            <button
              onClick={handlePhoneSubmit}
              disabled={isLoading || phone.length !== 10}
              className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  OTP పంపండి
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </>
        )}

        {/* OTP Input Step */}
        {step === 'otp' && (
          <>
            <input
              type="tel"
              inputMode="numeric"
              value={otp}
              onChange={handleOtpChange}
              placeholder="4 అంకెల OTP"
              className="input-village text-center text-2xl tracking-[0.5em]"
              autoFocus
            />

            <p className="text-muted-foreground text-sm text-center">
              +91 {phone} కి OTP పంపించాము
            </p>

            {error && (
              <p className="text-destructive text-sm text-center animate-fade-in">
                {error}
              </p>
            )}

            <button
              onClick={handleOtpSubmit}
              disabled={isLoading || otp.length !== 4}
              className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  ధృవీకరించండి
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={() => setStep('phone')}
              className="w-full text-center text-muted-foreground text-sm py-2"
            >
              నెంబర్ మార్చండి
            </button>
          </>
        )}

        {/* Name Input Step */}
        {step === 'name' && (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="మీ పేరు (ఐచ్ఛికం)"
              className="input-village"
              autoFocus
            />

            <button
              onClick={handleNameSubmit}
              className="btn-accent w-full flex items-center justify-center gap-2"
            >
              కొనసాగించండి
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleNameSubmit}
              className="w-full text-center text-muted-foreground text-sm py-2"
            >
              దాటవేయండి
            </button>
          </>
        )}
      </div>

      {/* Village Badge */}
      <div className="px-6 pb-8 text-center">
        <span className="trust-badge">
          📍 Metlachittapur, Metpally
        </span>
      </div>
    </div>
  );
}
