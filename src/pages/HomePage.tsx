import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, UtensilsCrossed, ShoppingBasket, Pill, Sprout } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

import culturalPottery from '@/assets/cultural-pottery.jpg';
import culturalTextile from '@/assets/cultural-textile.jpg';

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

  const isTeluguActive = language === 'te';

  const displayName =
    localStorage.getItem('mana-angadi-user-name') ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Guest');

  const villageSpecials = [
    {
      image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=300&fit=crop',
      label: t.villageGrown,
      title: t.freshVegetables,
    },
    {
      image: culturalPottery,
      label: t.handcrafted,
      title: t.clayPottery,
    },
    {
      image: culturalTextile,
      label: t.villageLoom,
      title: t.cottonTextiles,
    },
  ];

  const essentialItems = [
    { icon: UtensilsCrossed, label: t.food },
    { icon: ShoppingBasket, label: t.groceries },
    { icon: Pill, label: t.pharmacy },
    { icon: Sprout, label: t.fruitsAndVeg },
  ];

  return (
    <MobileLayout>
      <div className="max-w-md mx-auto min-h-screen relative pb-28 bg-mana-cream text-mana-charcoal font-newsreader selection:bg-primary/20">

        {/* ──────────── 1. HEADER ──────────── */}
        <header className="px-6 pt-10 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase opacity-60">
                {t.welcomeToAngadi}
              </p>
              <h1 className="text-2xl font-medium leading-tight mt-1">
                {t.namaskaram},<br />
                {displayName} {t.gaaru}
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
                <Bell className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>

        {/* ──────────── 2. VILLAGE SPECIALS ──────────── */}
        <section className="mt-2">
          <div className="px-6 flex justify-between items-baseline mb-3">
            <h2 className="text-lg font-semibold">{t.villageSpecials}</h2>
            <span className="text-xs italic opacity-50">{t.seasonalPicks}</span>
          </div>

          <div className="flex overflow-x-auto gap-3 px-6 hide-scrollbar">
            {villageSpecials.map((item) => (
              <div key={item.title} className="flex-none w-64">
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-mana-charcoal/5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-[9px] uppercase tracking-tighter opacity-80">
                      {item.label}
                    </p>
                    <p className="text-base font-medium">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────── 3. EXPLORE CTA ──────────── */}
        <section className="px-6 mt-6">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-primary text-white py-4 rounded-xl text-lg font-medium shadow-lg shadow-primary/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            {t.exploreAngadi}
            <ArrowRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </section>

        {/* ──────────── 4. RECENTLY ORDERED ──────────── */}
        <section className="mt-8">
          <div className="px-6 flex justify-between items-baseline mb-3">
            <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-bold">
              {t.recentlyOrdered}
            </p>
            <button className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
              {t.viewAll}
            </button>
          </div>

          <div className="flex overflow-x-auto gap-4 px-6 hide-scrollbar">
            {recentItems.map((item) => (
              <div key={item.labelEn} className="flex-none w-16 flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 rounded-full bg-white border border-mana-charcoal/5 p-1 shadow-sm overflow-hidden">
                  <img
                    src={item.image}
                    alt={language === 'te' ? item.labelTe : item.labelEn}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-sans opacity-70 text-center">
                  {language === 'te' ? item.labelTe : item.labelEn}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────── 5. DAILY ESSENTIALS GRID ──────────── */}
        <section className="px-6 mt-8">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-bold mb-4">
            {t.dailyEssentials}
          </p>
          <div className="grid grid-cols-4 gap-3">
            {essentialItems.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="aspect-square bg-white border border-mana-charcoal/5 rounded-xl flex flex-col items-center justify-center shadow-sm gap-1.5"
              >
                <Icon className="text-primary w-6 h-6" strokeWidth={1.5} />
                <span className="text-[11px] font-sans font-medium opacity-80">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ──────────── 6. COMMUNITY NOTICE ──────────── */}
        <section className="px-6 mt-8 mb-4">
          <div className="bg-white border border-mana-charcoal/10 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="uppercase tracking-widest text-[9px] font-bold opacity-60">
                {t.communityLabel}
              </span>
            </div>
            <p className="text-sm italic leading-relaxed text-mana-charcoal/80 mb-3">
              {t.communityMessage}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full bg-mana-charcoal/10 border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-[9px] font-bold bg-mana-charcoal text-white w-4 h-4 rounded-full flex items-center justify-center">
                +12
              </span>
              <span className="text-[10px] opacity-50 ml-1">{t.neighboursJoined}</span>
            </div>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
