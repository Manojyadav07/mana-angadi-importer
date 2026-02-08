import { useNavigate } from 'react-router-dom';
import { useShops } from '@/hooks/useShops';
import { useLanguage } from '@/context/LanguageContext';

export function VillageShops() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: shops = [] } = useShops();

  const visibleShops = shops.filter((s) => s.isActive).slice(0, 6);

  if (visibleShops.length === 0) return null;

  return (
    <section className="px-5 pt-4 pb-6">
      <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">
        {language === 'en' ? 'Local shops near you' : 'మీ దగ్గర అంగడులు'}
      </p>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
        {visibleShops.map((shop) => {
          const name = language === 'te' ? shop.name_te : shop.name_en;
          const initials = name.slice(0, 2).toUpperCase();

          return (
            <button
              key={shop.id}
              onClick={() => navigate(`/shop/${shop.id}`)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity touch-manipulation"
            >
              <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">{initials}</span>
              </div>
              <span className="text-2xs text-foreground font-medium max-w-[56px] truncate text-center">
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
