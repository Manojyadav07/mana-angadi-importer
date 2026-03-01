import { useNavigate } from 'react-router-dom';
import { useShops } from '@/hooks/useShops';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export function VillageShops() {
  const navigate = useNavigate();
  const { data: shops = [] } = useShops((useAuth().profile as any)?.town_id);
  const { language } = useLanguage();

  const visibleShops = shops.filter((s) => s.isActive).slice(0, 6);

  if (visibleShops.length === 0) return null;

  return (
    <section className="px-5 pt-5 pb-6">
      <div className="h-[1px] bg-accent/20 mb-4" />

      <p className="text-[13px] font-medium text-muted-foreground mb-4">
        {language === 'en' ? 'From your Angadi' : 'మీ అంగడి నుండి'}
      </p>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
        {visibleShops.map((shop) => {
          const name = language === 'en' ? shop.name_en : shop.name_te;
          const initials = shop.name_en.slice(0, 2).toUpperCase();

          return (
            <button
              key={shop.id}
              onClick={() => navigate(`/shop/${shop.id}`)}
              className="flex-shrink-0 flex flex-col items-center gap-2 active:opacity-70 transition-opacity touch-manipulation"
            >
              <div className="w-14 h-14 rounded-full bg-card border border-border/60 flex items-center justify-center">
                <span className="text-[11px] font-semibold text-foreground/60">{initials}</span>
              </div>
              <span className="text-[11px] text-foreground/60 font-medium max-w-[56px] truncate text-center">
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
