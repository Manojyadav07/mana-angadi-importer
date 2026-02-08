import { useLanguage } from '@/context/LanguageContext';

interface AvailItem {
  label: string;
  status: 'open' | 'limited' | 'available';
}

export function AvailabilitySection() {
  const { language } = useLanguage();

  const items: AvailItem[] = [
    { label: language === 'en' ? 'Food' : 'ఆహారం', status: 'open' },
    { label: language === 'en' ? 'Grocery' : 'కిరాణా', status: 'open' },
    { label: language === 'en' ? 'Pharmacy' : 'మందులు', status: 'available' },
    { label: language === 'en' ? 'Vegetables & Fruits' : 'కూరగాయలు & పండ్లు', status: 'limited' },
  ];

  const statusLabel = (s: AvailItem['status']) => {
    if (language === 'en') {
      return s === 'open' ? 'Open' : s === 'limited' ? 'Limited' : 'Available';
    }
    return s === 'open' ? 'తెరిచి ఉంది' : s === 'limited' ? 'పరిమితం' : 'అందుబాటులో';
  };

  const dotColor = (s: AvailItem['status']) =>
    s === 'open' ? 'bg-success' : s === 'limited' ? 'bg-warning' : 'bg-primary';

  return (
    <section className="px-5 pt-5 pb-2">
      <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">
        {language === 'en' ? 'Ee roju dorikedi' : 'ఈ రోజు దొరికేది'}
      </p>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-2xs text-muted-foreground">{statusLabel(item.status)}</span>
              <span className={`w-2 h-2 rounded-full ${dotColor(item.status)}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
