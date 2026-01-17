import { useLanguage } from '@/context/LanguageContext';
import { Store, Heart } from 'lucide-react';

interface WelcomeScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

export function WelcomeScreen({ onContinue, onSkip }: WelcomeScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Logo */}
        <div className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 animate-scale-in">
          <Store className="w-14 h-14 text-primary" />
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold text-foreground animate-fade-in">
          {t.appName}
        </h1>

        {/* Welcome Message */}
        <div className="mt-8 space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <p className="text-lg text-foreground leading-relaxed">
            {t.welcomeMessage}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t.welcomeSubMessage}
          </p>
        </div>

        {/* Trust Icon */}
        <div className="mt-8 flex items-center gap-2 text-primary animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Heart className="w-5 h-5 fill-primary" />
          <span className="text-sm font-medium">{t.villageBadge}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 pb-12 space-y-3 animate-slide-up">
        <button
          onClick={onContinue}
          className="btn-accent w-full"
        >
          {t.okay}
        </button>
        <button
          onClick={onSkip}
          className="w-full py-3 text-muted-foreground font-medium hover:text-foreground transition-colors"
        >
          {t.skip}
        </button>
      </div>
    </div>
  );
}
