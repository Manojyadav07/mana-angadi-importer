import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface Promo {
  id: string;
  text: string;
}

const PROMO_STRIP_KEY = 'mana_promo_strip_dismissed';

function isDismissedToday(): boolean {
  try {
    const raw = localStorage.getItem(PROMO_STRIP_KEY);
    if (!raw) return false;
    const { date } = JSON.parse(raw);
    return date === new Date().toDateString();
  } catch {
    return false;
  }
}

export function PromotionStrip() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  const promos: Promo[] = [
    { id: '1', text: 'Free delivery today on all orders' },
    { id: '2', text: 'New grocery shop joined your village' },
    { id: '3', text: 'Medicine delivery available now' },
  ];

  useEffect(() => {
    setHidden(isDismissedToday());
  }, []);

  useEffect(() => {
    if (hidden || promos.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % promos.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [hidden, promos.length]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(PROMO_STRIP_KEY, JSON.stringify({ date: new Date().toDateString() }));
    setHidden(true);
  }, []);

  if (hidden || promos.length === 0) return null;

  const current = promos[activeIndex];

  return (
    <section className="px-5 pt-4 pb-1">
      <div className="bg-card rounded-xl px-4 py-3 flex items-center justify-between gap-3 border border-border/40">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[10px] font-medium tracking-wide uppercase text-accent flex-shrink-0">
            Featured
          </span>
          <p className="text-[13px] text-foreground/70 leading-snug flex-1 min-w-0 truncate">
            {current.text}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-muted-foreground/30 active:text-muted-foreground/60 transition-colors touch-manipulation"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.4} />
        </button>
      </div>

      {promos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {promos.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-colors duration-500 ${
                i === activeIndex ? 'bg-foreground/30' : 'bg-foreground/8'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
