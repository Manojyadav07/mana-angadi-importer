import { Leaf, Bell } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export function TopBar() {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Extract display name from user metadata or email
  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || (user?.email ? user.email.split('@')[0] : null);

  const greeting = displayName
    ? `${displayName} gaaru`
    : language === 'en' ? 'Welcome' : 'స్వాగతం';

  const location = language === 'en' ? 'Metlachittapur' : 'మెట్లచిట్టాపూర్';

  return (
    <header className="sticky top-0 z-20 bg-primary px-4 py-3 flex items-center justify-between">
      {/* Leaf branding */}
      <div className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
        <Leaf className="w-5 h-5 text-primary-foreground" />
      </div>

      {/* Center: location + name */}
      <div className="flex-1 mx-3 text-center">
        <p className="text-xs text-primary-foreground/70 leading-tight truncate">
          {location}
        </p>
        <p className="text-base font-bold text-primary-foreground leading-tight truncate">
          {greeting}
        </p>
      </div>

      {/* Notification bell */}
      <button className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
        <Bell className="w-5 h-5 text-primary-foreground" />
      </button>
    </header>
  );
}
