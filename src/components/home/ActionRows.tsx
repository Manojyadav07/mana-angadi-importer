import { useNavigate } from 'react-router-dom';

interface ActionItem {
  label: string;
  path: string;
}

export function ActionRows() {
  const navigate = useNavigate();

  const items: ActionItem[] = [
    { label: 'Food', path: '/home' },
    { label: 'Grocery', path: '/home' },
    { label: 'Pharmacy', path: '/home' },
    { label: 'Vegetables & Fruits', path: '/home' },
  ];

  return (
    <section className="px-5 pt-8 pb-2">
      <p className="text-center text-[15px] font-medium text-foreground/60 mb-6">
        What do you need today?
      </p>
      <div className="flex flex-col gap-3.5">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-full py-5 px-6 rounded-2xl bg-card shadow-[0_1px_3px_0_hsl(var(--foreground)/0.04)] text-[16px] font-medium text-foreground text-left active:translate-y-[1px] active:shadow-none transition-all duration-200 touch-manipulation"
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
