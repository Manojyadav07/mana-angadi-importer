import { MapPin, Bell } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function TopBar() {
  const { language } = useLanguage();

  return (
    <header className="px-4 pt-4 pb-2 flex items-center justify-between">
      {/* Location pill */}
      <button className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 active:scale-[0.97] transition-transform">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
          {language === 'en' ? 'Metlachittapur' : 'మెట్లచిట్టాపూర్'}
        </span>
        <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
      </button>

      {/* Notification icon */}
      <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform relative">
        <Bell className="w-5 h-5 text-muted-foreground" />
      </button>
    </header>
  );
}
