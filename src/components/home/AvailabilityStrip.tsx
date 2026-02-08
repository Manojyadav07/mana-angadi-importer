import { useLanguage } from '@/context/LanguageContext';

interface AvailItem {
  label: string;
  status: 'open' | 'limited' | 'available';
  dotColor: string;
}

export function AvailabilityStrip() {
  const { language } = useLanguage();

  const items: AvailItem[] = [
    {
      label: language === 'en' ? 'Grocery' : 'కిరాణా',
      status: 'open',
      dotColor: 'bg-success',
    },
    {
      label: language === 'en' ? 'Vegetables' : 'కూరగాయలు',
      status: 'limited',
      dotColor: 'bg-warning',
    },
    {
      label: language === 'en' ? 'Medicine' : 'మందులు',
      status: 'open',
      dotColor: 'bg-success',
    },
    {
      label: language === 'en' ? 'Services' : 'సేవలు',
      status: 'available',
      dotColor: 'bg-primary',
    },
  ];

  const statusLabel = (s: AvailItem['status']) => {
    if (language === 'en') {
      return s === 'open' ? 'Open' : s === 'limited' ? 'Limited' : 'Available';
    }
    return s === 'open' ? 'తెరిచి ఉంది' : s === 'limited' ? 'పరిమితం' : 'అందుబాటులో';
  };

  return (
    <section className="px-4 mt-5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
        {language === 'en' ? 'Available Now' : 'ఇప్పుడు అందుబాటులో'}
      </p>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex-shrink-0 flex items-center gap-2 bg-card border border-border rounded-full px-3.5 py-2"
          >
            <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">{item.label}</span>
            <span className="text-2xs text-muted-foreground whitespace-nowrap">{statusLabel(item.status)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
