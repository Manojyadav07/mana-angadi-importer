import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GampaIcon } from './GampaIcon';
import villageHeaderBg from '@/assets/village-header-bg.jpg';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function TopBar() {
  const { user } = useAuth();

  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || (user?.email ? user.email.split('@')[0] : null);

  return (
    <header className="relative overflow-hidden" style={{ minHeight: 160 }}>
      {/* Village illustration background */}
      <img
        src={villageHeaderBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />
      {/* Soft tint overlay */}
      <div className="absolute inset-0 bg-[hsl(150_28%_28%/0.45)]" />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between px-5 pt-5 pb-6">
        {/* Left: icon + greeting */}
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-[hsl(36_47%_97%/0.2)] backdrop-blur-sm flex items-center justify-center">
            <GampaIcon className="w-5 h-5 text-[hsl(36_47%_97%/0.9)]" strokeWidth={1.5} />
          </div>
          <div>
            {displayName ? (
              <p className="text-[16px] font-medium text-[hsl(36_47%_97%/0.95)] leading-tight">
                {displayName} Gaaru
              </p>
            ) : (
              <p className="text-[16px] font-medium text-[hsl(36_47%_97%/0.95)] leading-tight">
                Welcome back
              </p>
            )}
            <p className="text-[11px] text-[hsl(36_47%_97%/0.6)] leading-tight mt-1">
              Metlachittapur
            </p>
          </div>
        </div>

        {/* Right: bell */}
        <button className="w-9 h-9 flex items-center justify-center text-[hsl(36_47%_97%/0.5)] active:text-[hsl(36_47%_97%/0.8)] transition-colors mt-1">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.3} />
        </button>
      </div>
    </header>
  );
}
