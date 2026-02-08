import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Send, Wrench } from 'lucide-react';
import { GampaIcon } from './GampaIcon';
import { useLanguage } from '@/context/LanguageContext';

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  path: string;
  accentClass: string;
}

export function ActionGrid() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const actions: ActionItem[] = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      label: language === 'en' ? 'Get Items' : 'వస్తువులు తెచ్చుకోండి',
      sublabel: language === 'en' ? 'Grocery & more' : 'కిరాణా & ఇంకా',
      path: '/home',
      accentClass: 'text-primary bg-primary/10',
    },
    {
      icon: <GampaIcon className="w-8 h-8" />,
      label: language === 'en' ? 'Basket' : 'గంప',
      sublabel: language === 'en' ? 'Your picks' : 'మీ ఎంపికలు',
      path: '/cart',
      accentClass: 'text-accent bg-accent/10',
    },
    {
      icon: <Send className="w-8 h-8" />,
      label: language === 'en' ? 'Send / Receive' : 'పంపు / తీసుకో',
      sublabel: language === 'en' ? 'Parcels' : 'పార్సిల్స్',
      path: '/home',
      accentClass: 'text-warning bg-warning/10',
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      label: language === 'en' ? 'Local Services' : 'స్థానిక సేవలు',
      sublabel: language === 'en' ? 'Near you' : 'మీ దగ్గర',
      path: '/home',
      accentClass: 'text-secondary-foreground bg-secondary',
    },
  ];

  return (
    <div className="px-4 grid grid-cols-2 gap-3 stagger-children">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => navigate(a.path)}
          className="bg-card rounded-2xl border border-border p-5 flex flex-col items-center gap-2.5 shadow-sm active:scale-[0.97] transition-transform touch-manipulation"
        >
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${a.accentClass}`}>
            {a.icon}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground leading-tight">{a.label}</p>
            <p className="text-2xs text-muted-foreground mt-0.5">{a.sublabel}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
