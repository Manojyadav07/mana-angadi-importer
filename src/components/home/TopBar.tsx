import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GampaIcon } from './GampaIcon';
import villageHeaderBg from '@/assets/village-header-bg.jpg';

export function TopBar() {
  const { user } = useAuth();

  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || (user?.email ? user.email.split('@')[0] : null);

  return (
    <header className="relative overflow-hidden" style={{ minHeight: 170 }}>
      {/* Village watercolor background */}
      <img
        src={villageHeaderBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />
      {/* Muted green overlay 75% */}
      <div className="absolute inset-0" style={{ backgroundColor: 'hsla(150, 25%, 25%, 0.75)' }} />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between px-5 pt-6 pb-7">
        <div className="flex flex-col gap-3.5">
          {/* Icon badge */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsla(36, 47%, 97%, 0.15)' }}>
            <GampaIcon className="w-5 h-5 text-[hsla(36,47%,97%,0.85)]" strokeWidth={1.5} />
          </div>

          {/* Name + location */}
          <div>
            <p className="text-[17px] font-medium leading-tight" style={{ color: 'hsla(36, 47%, 97%, 0.95)' }}>
              {displayName ? `${displayName} Gaaru` : 'Welcome back'}
            </p>
            <p className="text-[11px] leading-tight mt-1" style={{ color: 'hsla(36, 47%, 97%, 0.55)' }}>
              Metlachittapur
            </p>
          </div>
        </div>

        {/* Bell */}
        <button
          className="w-9 h-9 flex items-center justify-center transition-colors mt-1"
          style={{ color: 'hsla(36, 47%, 97%, 0.45)' }}
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.3} />
        </button>
      </div>
    </header>
  );
}
