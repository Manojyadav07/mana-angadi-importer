import { useNavigate } from 'react-router-dom';
import { useShops } from '@/hooks/useShops';
import { useLanguage } from '@/context/LanguageContext';

export function TrustSection() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: shops = [] } = useShops();

  const visibleShops = shops.filter((s) => s.isActive).slice(0, 5);

  if (visibleShops.length === 0) return null;

  return (
    <section className="px-4 mt-5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
        {language === 'en' ? 'Your Village Shops' : 'మీ ఊరి అంగడులు'}
      </p>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {visibleShops.map((shop) => {
          const name = language === 'te' ? shop.name_te : shop.name_en;
          const initials = name.slice(0, 2).toUpperCase();

          return (
            <button
              key={shop.id}
              onClick={() => navigate(`/shop/${shop.id}`)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-border flex items-center justify-center overflow-hidden">
              {false ? (
                  <img src="" alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary">{initials}</span>
                )}
              </div>
              <span className="text-2xs text-foreground font-medium max-w-[60px] truncate text-center">
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
