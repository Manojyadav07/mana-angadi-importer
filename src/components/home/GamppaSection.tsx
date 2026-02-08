import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { GampaIcon } from './GampaIcon';

export function GamppaSection() {
  const navigate = useNavigate();
  const { getCartItemCount } = useApp();
  const { language } = useLanguage();
  const count = getCartItemCount();

  const title = language === 'en' ? 'Mee Gamppa' : 'మీ గంప';
  const emptyText = language === 'en' ? 'Mee gamppa khaali ga undi' : 'మీ గంప ఖాళీగా ఉంది';
  const itemsText = language === 'en'
    ? `${count} vastuvulu gamppa lo unnayi`
    : `${count} వస్తువులు గంపలో ఉన్నాయి`;

  return (
    <section className="px-5 pt-4 pb-2">
      <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">
        {title}
      </p>
      <button
        onClick={() => navigate('/cart')}
        className="w-full flex items-center gap-4 py-3 active:bg-muted/50 transition-colors touch-manipulation"
      >
        <div className="text-muted-foreground">
          <GampaIcon className="w-7 h-7" strokeWidth={1.3} />
        </div>
        <span className="text-sm text-foreground/70 flex-1 text-left">
          {count > 0 ? itemsText : emptyText}
        </span>
      </button>
    </section>
  );
}
