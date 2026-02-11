import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GampaIcon } from './GampaIcon';

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
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm px-5 py-3 flex items-center justify-between">
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-muted-foreground/40">
        <GampaIcon className="w-5 h-5" strokeWidth={1.5} />
      </div>

      <div className="flex-1 mx-3 text-center">
        {displayName ? (
          <p className="text-[14px] font-medium text-foreground/70 leading-tight truncate">
            {getGreeting()}, {displayName} Gaaru
          </p>
        ) : (
          <p className="text-[14px] font-medium text-foreground/70 leading-tight truncate">
            Welcome back
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/50 leading-tight truncate mt-0.5">
          Metlachittapur
        </p>
      </div>

      <button className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-muted-foreground/30 active:text-muted-foreground/60 transition-colors">
        <Bell className="w-[18px] h-[18px]" strokeWidth={1.3} />
      </button>
    </header>
  );
}
