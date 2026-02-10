import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GampaIcon } from './GampaIcon';

export function TopBar() {
  const { user } = useAuth();

  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || (user?.email ? user.email.split('@')[0] : null);

  const nameDisplay = displayName || 'Mana Angadi';

  return (
    <header className="sticky top-0 z-20 bg-background px-5 py-3.5 flex items-center justify-between border-b border-border/40">
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-muted-foreground/50">
        <GampaIcon className="w-5 h-5" strokeWidth={1.5} />
      </div>

      <div className="flex-1 mx-3 text-center">
        <p className="text-[15px] font-semibold text-foreground leading-tight truncate">
          {nameDisplay}
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5">
          Metlachittapur
        </p>
      </div>

      <button className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-muted-foreground/40 active:text-muted-foreground transition-colors">
        <Bell className="w-[18px] h-[18px]" strokeWidth={1.4} />
      </button>
    </header>
  );
}
