import { useLanguage } from '@/context/LanguageContext';
import { Store } from 'lucide-react';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { t, language, setLanguage } = useLanguage();

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

        {/* Welcome Title */}
        <p className="text-xl text-foreground mt-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {t.welcome}
        </p>

        {/* Language Selection Prompt */}
        <p className="text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          {t.chooseLanguageFirst}
        </p>

        {/* Language Selector - Prominent */}
        <div className="mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center bg-muted rounded-full p-1.5">
            <button
              onClick={() => setLanguage('te')}
              className={`px-6 py-3 rounded-full text-base font-medium transition-all ${
                language === 'te'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-6 py-3 rounded-full text-base font-medium transition-all ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Village Badge */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <span className="trust-badge">
            {t.villageBadge}
          </span>
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-6 pb-12 animate-slide-up">
        <button
          onClick={onContinue}
          className="btn-accent w-full"
        >
          {t.continue}
        </button>
      </div>
    </div>
  );
}
