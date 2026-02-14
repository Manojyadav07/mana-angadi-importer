import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, UtensilsCrossed, ShoppingBasket, Pill, Sprout, Home, Heart, ShoppingCart, Truck, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';

const recentItems = [
  { image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop', labelEn: 'Rice', labelTe: 'బియ్యం' },
  { image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&h=100&fit=crop', labelEn: 'Oil', labelTe: 'నూనె' },
  { image: 'https://images.unsplash.com/photo-1607672632458-9eb56696346a?w=100&h=100&fit=crop', labelEn: 'Dal', labelTe: 'పప్పు' },
  { image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&h=100&fit=crop', labelEn: 'Sugar', labelTe: 'చక్కెర' },
  { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop', labelEn: 'Flour', labelTe: 'పిండి' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { getCartItemCount } = useApp();
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
    <div className="max-w-md mx-auto min-h-screen relative pb-28 bg-mana-cream text-mana-charcoal font-display selection:bg-primary/20">

      {/* 1. HEADER */}
      <header className="px-6 pt-10 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase opacity-60 mb-0.5">{t.welcomeHome}</p>
            <h1 className="text-2xl font-medium leading-tight text-mana-charcoal">
              {t.namaskaram}, <br />{displayName} {t.gaaru}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(isTeluguActive ? 'en' : 'te')}
              className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-mana-charcoal/10 bg-white/80"
            >
              {isTeluguActive ? 'EN' : 'తె'}
            </button>
            <button className="w-9 h-9 rounded-full bg-mana-charcoal/5 flex items-center justify-center">
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
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-mana-charcoal/5">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&h=300&fit=crop" alt={language === 'te' ? 'బంగినపల్లి మామిడి' : 'Banganapalli Gold'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-[9px] uppercase tracking-tighter opacity-80">{language === 'te' ? 'చిత్తూరు తోటలు' : 'Chittoor Orchards'}</p>
                <p className="text-base font-medium">{language === 'te' ? 'బంగినపల్లి గోల్డ్' : 'Banganapalli Gold'}</p>
              </div>
            </div>
          </div>
          <div className="flex-none w-64">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-mana-charcoal/5">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=300&fit=crop" alt={language === 'te' ? 'ఉదయపు ఆకుకూరలు' : 'Morning Greens Basket'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-[9px] uppercase tracking-tighter opacity-80">{language === 'te' ? 'స్థానిక పంట' : 'Local Harvest'}</p>
                <p className="text-base font-medium">{language === 'te' ? 'ఉదయపు ఆకుకూరల బుట్ట' : 'Morning Greens Basket'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE CTA */}
      <section className="px-6 mt-6">
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-primary text-white py-4 rounded-xl text-lg font-medium shadow-lg shadow-primary/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <span>{t.exploreAngadi}</span>
          <ArrowRight className="w-5 h-5" strokeWidth={2} />
        </button>
      </section>

      {/* 4. RECENTLY ORDERED */}
      <section className="mt-8">
        <div className="px-6 flex justify-between items-baseline mb-3">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-bold">{t.recentlyOrdered}</p>
          <button className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t.viewAll}</button>
        </div>
        <div className="flex overflow-x-auto gap-4 px-6 hide-scrollbar">
          {recentItems.map((item) => (
            <div key={item.labelEn} className="flex-none w-16 flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-white border border-mana-charcoal/5 p-1 shadow-sm overflow-hidden">
                <img src={item.image} alt={language === 'te' ? item.labelTe : item.labelEn} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-[10px] font-sans text-mana-charcoal/70 text-center leading-tight">{language === 'te' ? item.labelTe : item.labelEn}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DAILY ESSENTIALS GRID */}
      <section className="px-6 mt-8">
        <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-bold mb-4">{t.dailyEssentials}</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: UtensilsCrossed, label: t.food },
            { icon: ShoppingBasket, label: t.groceries },
            { icon: Pill, label: t.pharmacy },
            { icon: Sprout, label: t.fruitsAndVeg },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="aspect-square bg-white border border-mana-charcoal/5 rounded-xl flex flex-col items-center justify-center shadow-sm gap-1.5">
              <Icon className="text-primary w-6 h-6" strokeWidth={1.5} />
              <span className="text-[11px] font-sans font-medium opacity-80">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 6. COMMUNITY NOTICE */}
      <section className="px-6 mt-8 mb-4">
        <div className="bg-white border border-mana-charcoal/10 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="uppercase tracking-widest text-[9px] font-bold opacity-60">{t.communityLabel}</span>
          </div>
          <p className="text-sm italic leading-relaxed text-mana-charcoal/80 mb-3">{t.communityMessage}</p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-mana-charcoal/10 border-2 border-white" />
              ))}
            </div>
            <span className="text-[7px] font-bold bg-mana-charcoal text-white w-4 h-4 rounded-full flex items-center justify-center">+12</span>
            <span className="text-[10px] opacity-50 ml-1">{t.neighboursJoined}</span>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-mana-charcoal/5 px-8 pt-3 pb-6 z-50">
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
              <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
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
