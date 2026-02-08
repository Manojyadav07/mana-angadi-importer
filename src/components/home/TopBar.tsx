import { Bell } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { GampaIcon } from './GampaIcon';

export function TopBar() {
  const { language } = useLanguage();
  const { user } = useAuth();

  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || (user?.email ? user.email.split('@')[0] : null);

  const greeting = displayName
    ? `${displayName} gaaru`
    : language === 'en' ? 'Welcome' : 'స్వాగతం';

  const location = language === 'en' ? 'Metlachittapur' : 'మెట్లచిట్టాపూర్';

  return (
    <header className="sticky top-0 z-20 bg-primary px-4 py-3 flex items-center justify-between">
      {/* Mana Angadi icon */}
      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 text-primary-foreground opacity-80">
        <GampaIcon className="w-6 h-6" strokeWidth={1.8} />
      </div>

      {/* Center: name + village */}
      <div className="flex-1 mx-3 text-center">
        <p className="text-base font-bold text-primary-foreground leading-tight truncate">
          {greeting}
        </p>
        <p className="text-2xs text-primary-foreground/60 leading-tight truncate mt-0.5">
          {location}
        </p>
      </div>

      {/* Notification bell */}
      <button className="w-9 h-9 flex items-center justify-center flex-shrink-0 text-primary-foreground opacity-70 active:opacity-100 transition-opacity">
        <Bell className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </header>
  );
}
