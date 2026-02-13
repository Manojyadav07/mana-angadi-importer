import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, UtensilsCrossed, ShoppingBasket, Pill, Sprout } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';

import culturalPaddy from '@/assets/cultural-paddy.jpg';
import culturalPottery from '@/assets/cultural-pottery.jpg';
import culturalTextile from '@/assets/cultural-textile.jpg';

const villageSpecials = [
  {
    image: culturalPaddy,
    label: 'Fresh Harvest',
    title: 'Organic Millets',
  },
  {
    image: culturalPottery,
    label: 'Handcrafted',
    title: 'Clay Pottery',
  },
  {
    image: culturalTextile,
    label: 'Village Loom',
    title: 'Cotton Textiles',
  },
];

const essentials = [
  { icon: UtensilsCrossed, label: 'Food' },
  { icon: ShoppingBasket, label: 'Groceries' },
  { icon: Pill, label: 'Pharmacy' },
  { icon: Sprout, label: 'Fruits & Veg' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName =
    localStorage.getItem('mana-angadi-user-name') ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Guest');

  return (
    <MobileLayout>
      <div className="max-w-md mx-auto min-h-screen relative pb-32 bg-mana-cream text-mana-charcoal font-newsreader selection:bg-primary/20">
        {/* ──────────── 1. HEADER ──────────── */}
        <header className="px-6 pt-12 pb-6 flex justify-between items-start">
          <div>
            <p className="text-sm tracking-widest uppercase opacity-60 mb-1">
              Welcome Home
            </p>
            <h1 className="text-3xl font-medium leading-tight">
              Namaskaram,
              <br />
              {displayName} Gaaru
            </h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-mana-charcoal/5 flex items-center justify-center">
            <Bell className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </header>

        {/* ──────────── 2. VILLAGE SPECIALS ──────────── */}
        <section className="mt-4">
          <div className="px-6 flex justify-between items-baseline mb-4">
            <h2 className="text-xl font-semibold">Village Specials</h2>
            <span className="text-sm italic opacity-50">Seasonal Picks</span>
          </div>

          <div className="flex overflow-x-auto gap-5 px-6 hide-scrollbar">
            {villageSpecials.map((item) => (
              <div key={item.title} className="flex-none w-72">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3 border border-mana-charcoal/5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-xs uppercase tracking-tighter opacity-80">
                      {item.label}
                    </p>
                    <p className="text-lg font-medium">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────── 3. MAIN ACTION CTA ──────────── */}
        <section className="px-6 mt-10">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-primary text-white py-5 rounded-xl text-xl font-medium shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            Explore Angadi
            <ArrowRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </section>

        {/* ──────────── 4. DAILY ESSENTIALS GRID ──────────── */}
        <section className="px-6 mt-12">
          <p className="text-sm uppercase tracking-widest opacity-40 mb-6 font-semibold">
            Daily Essentials
          </p>
          <div className="grid grid-cols-2 gap-4">
            {essentials.map((cat) => (
              <button
                key={cat.label}
                className="bg-white/50 border border-mana-charcoal/5 p-6 rounded-xl flex flex-col items-center text-center"
              >
                <cat.icon className="text-primary w-9 h-9 mb-4" strokeWidth={1.5} />
                <span className="text-lg font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ──────────── 5. COMMUNITY NOTICE ──────────── */}
        <section className="px-6 mt-10 mb-8">
          <div className="bg-white border border-mana-charcoal/10 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="uppercase tracking-widest text-xs font-bold opacity-60">
                Community
              </span>
            </div>
            <p className="text-lg italic leading-relaxed text-mana-charcoal/80 mb-4">
              Free delivery today on all orders above ₹200. Support your local village shops!
            </p>
            <div className="flex items-center gap-2">
              {/* Overlapping avatars */}
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-mana-charcoal/10 border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-xs font-bold bg-mana-charcoal text-white w-5 h-5 rounded-full flex items-center justify-center" style={{ fontSize: 10 }}>
                +12
              </span>
              <span className="text-xs opacity-50 ml-1">neighbours joined today</span>
            </div>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
