import { useNavigate } from 'react-router-dom';

interface ActionItem {
  label: string;
  path: string;
}

export function ActionRows() {
  const navigate = useNavigate();

  const items: ActionItem[] = [
    { label: 'Get food', path: '/home' },
    { label: 'Buy groceries', path: '/home' },
    { label: 'Need medicine', path: '/home' },
    { label: 'Vegetables & fruits', path: '/home' },
  ];

  return (
    <section className="px-5 pt-6 pb-2">
      <p className="text-[13px] font-medium text-muted-foreground mb-4">
        What would you like today?
      </p>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-full py-4 px-5 rounded-xl bg-card border border-border/50 text-[15px] font-medium text-foreground text-left active:bg-primary/5 active:border-primary/20 transition-colors touch-manipulation"
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
