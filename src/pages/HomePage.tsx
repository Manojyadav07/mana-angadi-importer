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
  { icon: UtensilsCrossed, label: 'Food', bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop' },
  { icon: ShoppingBasket, label: 'Groceries', bg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop' },
  { icon: Pill, label: 'Pharmacy', bg: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
  { icon: Sprout, label: 'Fruits & Veg', bg: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop' },
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

          <div className="flex overflow-x-auto gap-3 px-6 hide-scrollbar">
            {villageSpecials.map((item) => (
              <div key={item.title} className="flex-none w-44">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 border border-mana-charcoal/5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-[10px] uppercase tracking-tighter opacity-80">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────── 3. MAIN ACTION CTA ──────────── */}
        <section className="px-6 mt-6">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-primary text-white py-3.5 rounded-xl text-base font-medium shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            Explore Angadi
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </section>

        {/* ──────────── 4. DAILY ESSENTIALS GRID ──────────── */}
        <section className="px-6 mt-8">
          <p className="text-xs uppercase tracking-widest opacity-40 mb-4 font-semibold">
            Daily Essentials
          </p>
          <div className="grid grid-cols-2 gap-3">
            {essentials.map((cat) => (
              <button
                key={cat.label}
                className="relative overflow-hidden rounded-xl border border-mana-charcoal/5 flex flex-col items-center justify-end text-center"
                style={{ minHeight: 100 }}
              >
                <img src={cat.bg} alt={cat.label} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                <div className="relative z-10 pb-3">
                  <cat.icon className="text-white w-7 h-7 mb-1 mx-auto" strokeWidth={1.5} />
                  <span className="text-sm font-semibold text-white">{cat.label}</span>
                </div>
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
