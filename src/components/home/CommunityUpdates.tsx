import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Update {
  id: string;
  text: string;
}

const DISMISSED_KEY = 'mana_updates_dismissed';

function getDismissedToday(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    const { date, ids } = JSON.parse(raw);
    if (date !== new Date().toDateString()) return [];
    return ids as string[];
  } catch {
    return [];
  }
}

function dismissForToday(id: string) {
  const dismissed = getDismissedToday();
  dismissed.push(id);
  localStorage.setItem(
    DISMISSED_KEY,
    JSON.stringify({ date: new Date().toDateString(), ids: dismissed }),
  );
}

export function CommunityUpdates() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(getDismissedToday());
  }, []);

  // Level 1 — static community updates (will later come from DB)
  const updates: Update[] = [
    { id: 'free-delivery', text: 'Free delivery today on all orders' },
    { id: 'new-shop', text: 'New grocery shop added nearby' },
  ];

  const visible = updates.filter((u) => !dismissed.includes(u.id));
  if (visible.length === 0) return null;

  const handleDismiss = (id: string) => {
    dismissForToday(id);
    setDismissed((prev) => [...prev, id]);
  };

  return (
    <section className="px-5 pt-2 pb-1">
      <p className="text-[11px] font-medium text-muted-foreground/60 tracking-wide mb-2.5">
        Updates
      </p>
      <div className="space-y-2">
        {visible.map((update) => (
          <div
            key={update.id}
            className="flex items-start justify-between gap-3 py-2"
          >
            <span className="text-[13px] text-foreground/70 leading-snug">
              {update.text}
            </span>
            <button
              onClick={() => handleDismiss(update.id)}
              className="flex-shrink-0 mt-0.5 text-muted-foreground/30 active:text-muted-foreground/60 transition-colors touch-manipulation"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.4} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
