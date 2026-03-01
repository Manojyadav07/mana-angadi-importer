import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUserMode } from '@/context/UserModeContext';
import {
  User, ShoppingBag, Store, Truck, Globe, LogOut, ChevronRight, Loader2,
} from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { resetMode } = useUserMode();

  const handleLogout = async () => {
    resetMode();
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleLanguageChange = (lang: 'te' | 'en') => {
    setLanguage(lang);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const displayName = profile?.display_name || (language === 'en' ? 'User' : 'వినియోగదారు');
  const identifier = user?.email || (profile?.phone ? `+91 ${profile.phone}` : '');

  const sections = [
    {
      title: language === 'en' ? 'Account' : 'ఖాతా',
      items: [
        {
          icon: User,
          label: language === 'en' ? 'My Profile' : 'నా ప్రొఫైల్',
          onClick: () => {},
          subtitle: language === 'en' ? 'View your details' : 'మీ వివరాలు చూడండి',
        },
        {
          icon: ShoppingBag,
          label: t.myOrders,
          onClick: () => navigate('/orders'),
        },
      ],
    },
    {
      title: language === 'en' ? 'Opportunities' : 'అవకాశాలు',
      items: [
        {
          icon: Store,
          label: language === 'en' ? 'Apply as Merchant' : 'వ్యాపారిగా దరఖాస్తు చేయండి',
          onClick: () => navigate('/merchant/apply'),
        },
        {
          icon: Truck,
          label: language === 'en' ? 'Apply as Delivery Partner' : 'డెలివరీ పార్ట్‌నర్‌గా దరఖాస్తు చేయండి',
          onClick: () => navigate('/apply'),
        },
      ],
    },
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-foreground">{t.navProfile}</h1>
      </header>

      {/* User identity card */}
      <div className="mx-4 mt-2 mb-4 p-4 bg-card rounded-2xl border border-border flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{displayName}</p>
          {identifier && (
            <p className="text-sm text-muted-foreground truncate">{identifier}</p>
          )}
        </div>
      </div>

      <div className="px-4 pb-6 space-y-5">
        {/* Menu sections */}
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-muted/60 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Language preference */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
            {language === 'en' ? 'Preferences' : 'ప్రాధాన్యతలు'}
          </p>
          <div className="bg-card rounded-2xl border border-border px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4.5 h-4.5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{t.language}</p>
              </div>
              <div className="flex items-center bg-muted rounded-full p-1">
                <button
                  onClick={() => handleLanguageChange('te')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    language === 'te'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  తెలుగు
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    language === 'en'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
            {language === 'en' ? 'Session' : 'సెషన్'}
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl border border-destructive/20 active:bg-destructive/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-4.5 h-4.5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">{t.logout}</p>
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
