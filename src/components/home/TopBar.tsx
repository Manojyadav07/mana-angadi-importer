import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { GampaIcon } from './GampaIcon';
import villageHeaderBg from '@/assets/village-header-bg.jpg';
import { formatHonorific } from '@/lib/formatHonorific';

export function TopBar() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();

  const displayName = profile?.display_name
    || localStorage.getItem("mana-angadi-user-name")
    || user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || (user?.email ? user.email.split('@')[0] : null);

  const greeting = displayName
    ? formatHonorific(displayName, language)
    : (language === 'en' ? 'Welcome back' : 'తిరిగి స్వాగతం');

  return (
    <header className="relative overflow-hidden" style={{ minHeight: 170 }}>
      <img
        src={villageHeaderBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.14]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start justify-between px-5 pt-6 pb-7">
        <div className="flex flex-col gap-3.5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <GampaIcon className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>

          <div>
            <p className="text-[17px] font-medium leading-tight text-foreground">
              {greeting}
            </p>
            <p className="text-[11px] leading-tight mt-1 text-muted-foreground">
              {language === 'en' ? 'Metlachittapur' : 'మెట్లచిత్తాపూర్'}
            </p>
          </div>
        </div>

        <button className="w-9 h-9 flex items-center justify-center transition-colors mt-1 text-muted-foreground">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.3} />
        </button>
      </div>
    </header>
  );
}
