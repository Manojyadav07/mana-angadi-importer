import { useNavigate } from 'react-router-dom';
import { useShops } from '@/hooks/useShops';

export function VillageShops() {
  const navigate = useNavigate();
  const { data: shops = [] } = useShops();

  const visibleShops = shops.filter((s) => s.isActive).slice(0, 6);

  if (visibleShops.length === 0) return null;

  return (
    <section className="px-5 pt-6 pb-6">
      <p className="text-[13px] font-medium text-muted-foreground mb-4">
        Nearby shops
      </p>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
        {visibleShops.map((shop) => {
          const name = shop.name_en;
          const initials = name.slice(0, 2).toUpperCase();

          return (
            <button
              key={shop.id}
              onClick={() => navigate(`/shop/${shop.id}`)}
              className="flex-shrink-0 flex flex-col items-center gap-2 active:opacity-70 transition-opacity touch-manipulation"
            >
              <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
                <span className="text-[11px] font-semibold text-muted-foreground">{initials}</span>
              </div>
              <span className="text-[11px] text-foreground/70 font-medium max-w-[56px] truncate text-center">
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
