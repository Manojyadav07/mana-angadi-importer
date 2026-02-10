import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Promo {
  id: string;
  merchant: string;
  message: string;
}

const PROMO_DISMISSED_KEY = 'mana_promos_dismissed';

function isDismissedToday(): boolean {
  try {
    const raw = localStorage.getItem(PROMO_DISMISSED_KEY);
    if (!raw) return false;
    const { date } = JSON.parse(raw);
    return date === new Date().toDateString();
  } catch {
    return false;
  }
}

export function MerchantPromotion() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(isDismissedToday());
  }, []);

  // Level 2 — merchant promotions (will later come from DB)
  const promos: Promo[] = [
    { id: 'lakshmi-10', merchant: 'Lakshmi Stores', message: '10% off on groceries today' },
    { id: 'ravi-free', merchant: 'Ravi Medical', message: 'Free delivery on medicines this week' },
  ];

  if (hidden || promos.length === 0) return null;

  const current = promos[activeIndex];

  const handleDismiss = () => {
    localStorage.setItem(
      PROMO_DISMISSED_KEY,
      JSON.stringify({ date: new Date().toDateString() }),
    );
    setHidden(true);
  };

  const handleSwipe = (dir: 'left' | 'right') => {
    if (dir === 'left' && activeIndex < promos.length - 1) setActiveIndex(activeIndex + 1);
    if (dir === 'right' && activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  return (
    <section className="px-5 pt-1 pb-1">
      <div
        className="py-3 flex items-start justify-between gap-3"
        onTouchEnd={(e) => {
          const touch = e.changedTouches[0];
          const start = (e.target as HTMLElement).dataset.touchStart;
          if (start) {
            const diff = touch.clientX - Number(start);
            if (Math.abs(diff) > 40) handleSwipe(diff < 0 ? 'left' : 'right');
          }
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (e.currentTarget as HTMLElement).dataset.touchStart = String(touch.clientX);
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-foreground/80 leading-snug">
            {current.merchant}
          </p>
          <p className="text-[12px] text-muted-foreground/60 leading-snug mt-0.5">
            {current.message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 mt-0.5 text-muted-foreground/30 active:text-muted-foreground/60 transition-colors touch-manipulation"
          aria-label="Dismiss promotions"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.4} />
        </button>
      </div>

      {promos.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-1">
          {promos.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${
                i === activeIndex ? 'bg-foreground/30' : 'bg-foreground/10'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
