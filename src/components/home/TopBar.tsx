import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GampaIcon } from './GampaIcon';
import villageBg from '@/assets/village-header-bg.jpg';

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
    <header className="relative overflow-hidden rounded-b-3xl">
      {/* Village illustration background */}
      <div className="absolute inset-0">
        <img
          src={villageBg}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Soft dark-green tint overlay */}
        <div className="absolute inset-0 bg-[hsl(150_28%_22%/0.72)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 pt-6 pb-7 flex items-start justify-between">
        {/* Left: Icon + greeting */}
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-[hsl(36_47%_97%/0.15)] backdrop-blur-sm flex items-center justify-center">
            <GampaIcon className="w-5 h-5 text-[hsl(36_47%_97%/0.9)]" strokeWidth={1.5} />
          </div>
          <div>
            {displayName ? (
              <p className="text-[16px] font-medium text-[hsl(36_47%_97%/0.95)] leading-tight">
                {displayName} Gaaru
              </p>
            ) : (
              <p className="text-[16px] font-medium text-[hsl(36_47%_97%/0.95)] leading-tight">
                {getGreeting()}
              </p>
            )}
            <p className="text-[11px] text-[hsl(36_47%_97%/0.6)] leading-tight mt-1">
              Metlachittapur
            </p>
          </div>
        </div>

        {/* Right: Bell */}
        <button className="mt-1 w-9 h-9 flex items-center justify-center text-[hsl(36_47%_97%/0.5)] active:text-[hsl(36_47%_97%/0.8)] transition-colors touch-manipulation">
          <Bell className="w-[20px] h-[20px]" strokeWidth={1.3} />
        </button>
      </div>
    </header>
  );
}
