import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, Home, Heart, Truck, Menu } from 'lucide-react';
import { GampaIcon } from '@/components/home/GampaIcon';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/hooks/useCart';
import welcomeCyclist from '@/assets/welcome-cyclist.png';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { getCartItemCount } = useCart();
  const isTeluguActive = language === 'te';
  const cartCount = getCartItemCount();

  const displayName =
    localStorage.getItem('mana-angadi-user-name') ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Guest');

  const tabClass = (active: boolean) =>
    `flex flex-col items-center gap-1 ${active ? 'text-primary' : 'opacity-30'}`;
  const labelClass = 'text-[9px] uppercase tracking-widest font-bold';

  return (
    <div className="screen-shell relative pb-28 font-display selection:bg-primary/20">

      {/* 1. HEADER */}
      <header className="px-6 pt-10 pb-4 bg-mana-cream">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/30 bg-white shadow-sm flex-shrink-0">
              <img src={welcomeCyclist} alt="Mana Angadi" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="label-micro opacity-100 mb-0.5">{t.welcomeHome}</p>
              <h1 className="text-2xl font-medium leading-tight text-mana-charcoal">
                {t.namaskaram}, <br />{displayName} {t.gaaru}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(isTeluguActive ? 'en' : 'te')}
              className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-foreground/10 bg-mana-cream/80"
            >
              {isTeluguActive ? 'EN' : 'తె'}
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center bg-foreground/5">
              <Bell className="w-5 h-5 text-mana-charcoal" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. VILLAGE SPECIALS */}
      <section className="mt-2">
        <div className="px-6 flex justify-between items-baseline mb-3">
          <h2 className="text-lg font-semibold">{t.villageSpecials}</h2>
          <span className="text-xs opacity-50 italic">{t.seasonalPicks}</span>
        </div>
        <div className="flex overflow-x-auto px-6 gap-3 hide-scrollbar">
          <div className="flex-none w-64">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-foreground/5">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=300&fit=crop" alt={language === 'te' ? 'ఉదయపు ఆకుకూరలు' : 'Morning Greens Basket'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-[9px] uppercase tracking-tighter opacity-80">{language === 'te' ? 'స్థానిక పంట' : 'Local Grown'}</p>
                <p className="text-base font-medium">{language === 'te' ? 'ఉదయపు ఆకుకూరల బుట్ట' : 'Morning Greens Basket'}</p>
              </div>
            </div>
          </div>
          <div className="flex-none w-64">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-foreground/5">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&h=300&fit=crop" alt={language === 'te' ? 'బంగినపల్లి మామిడి' : 'Banganapalli Gold'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-[9px] uppercase tracking-tighter opacity-80">{language === 'te' ? 'స్థానిక పంట' : 'Local Grown'}</p>
                <p className="text-base font-medium">{language === 'te' ? 'బంగినపల్లి గోల్డ్' : 'Banganapalli Gold'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE CTA */}
      <section className="px-6 mt-6">
        <button
          onClick={() => navigate('/categories')}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm font-medium shadow-md shadow-primary/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <span>{t.exploreAngadi}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </section>

      {/* 4. DAILY ESSENTIALS GRID */}
      <section className="px-6 mt-6">
        <p className="label-micro mb-3">{t.dailyEssentials}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🍲', label: t.food, category: 'food', bg: 'rgba(234,140,46,0.12)', border: 'rgba(234,140,46,0.35)', ring: 'rgba(234,140,46,0.25)' },
            { icon: '🧺', label: t.groceries, category: 'groceries', bg: 'rgba(139,90,43,0.12)', border: 'rgba(139,90,43,0.35)', ring: 'rgba(139,90,43,0.25)' },
            { icon: '🏥', label: t.pharmacy, category: 'pharmacy', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.35)', ring: 'rgba(20,184,166,0.25)' },
            { icon: '🥬🍅', label: t.fruitsAndVeg, category: 'vegetables', bg: 'rgba(45,185,45,0.12)', border: 'rgba(45,185,45,0.35)', ring: 'rgba(45,185,45,0.25)' },
          ].map(({ icon, label, category, bg, border, ring }) => (
            <button
              key={label}
              onClick={() => navigate(`/shops?category=${category}`)}
              className="flex items-center gap-3 py-3 px-4 rounded-xl shadow-sm active:scale-[0.97] transition-transform touch-manipulation cursor-pointer bg-mana-cream/90"
              style={{ border: `1.5px solid ${border}` }}
            >
              <span className="relative flex-shrink-0">
                <span
                  className="absolute inset-0 rounded-full animate-[bloom-outer_3s_ease-in-out_infinite]"
                  style={{ background: ring, width: 48, height: 48, top: -4, left: -4 }}
                />
                <span
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: bg }}
                >
                  {icon}
                </span>
              </span>
              <span className="text-[13px] font-sans font-bold text-foreground/90 leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. COMMUNITY NOTICE */}
      <section className="px-6 mt-8 mb-4">
        <div className="card-notice">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">{t.communityLabel}</span>
          </div>
          <p className="text-sm italic leading-relaxed text-foreground/80 mb-3">{t.communityMessage}</p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-foreground/10 border-2 border-white" />
              ))}
            </div>
            <span className="text-[7px] font-bold bg-mana-charcoal text-white w-4 h-4 rounded-full flex items-center justify-center">+12</span>
            <span className="text-[10px] opacity-50 ml-1">{t.neighboursJoined}</span>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-mana-cream/95 backdrop-blur-md border-t border-foreground/5 px-8 pt-3 pb-6 z-50">
        <div className="flex justify-between items-end">
          <button onClick={() => navigate('/homepage')} className={tabClass(true)}>
            <Home className="w-6 h-6" strokeWidth={1.5} />
            <span className={labelClass}>{t.navHome}</span>
          </button>
          <button onClick={() => navigate('/favorites')} className={tabClass(false)}>
            <Heart className="w-6 h-6" strokeWidth={1.5} />
            <span className={labelClass}>{t.navSaved}</span>
          </button>
          <div className="relative -top-6">
            <button
              onClick={() => navigate('/cart')}
              className="bg-primary w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-6 ring-mana-cream"
            >
              <GampaIcon className="w-11 h-11" strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-mana-charcoal text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
          <button onClick={() => navigate('/orders')} className={tabClass(false)}>
            <Truck className="w-6 h-6" strokeWidth={1.5} />
            <span className={labelClass}>{t.navOrders}</span>
          </button>
          <button onClick={() => navigate('/profile')} className={tabClass(false)}>
            <Menu className="w-6 h-6" strokeWidth={1.5} />
            <span className={labelClass}>{t.navMenu}</span>
          </button>
        </div>
        <div className="h-2" />
      </nav>

    </div>
  );
}
