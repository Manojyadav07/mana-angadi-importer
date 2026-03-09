import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, Home, Heart, Truck, Menu } from 'lucide-react';
import { GampaIcon } from '@/components/home/GampaIcon';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/hooks/useCart';
import welcomeCyclist from '@/assets/welcome-cyclist.png';
import { formatHonorific } from '@/lib/formatHonorific';

// ── Animated Category Icons ──

function FoodIcon() {
  return (
    <span className="relative w-10 h-10 flex items-center justify-center text-2xl">
      <style>{`
        @keyframes steam1 {
          0%, 100% { opacity: 0; transform: translateY(0) scaleX(1); }
          50% { opacity: 1; transform: translateY(-6px) scaleX(1.2); }
        }
        @keyframes steam2 {
          0%, 100% { opacity: 0; transform: translateY(0) scaleX(1); }
          50% { opacity: 1; transform: translateY(-8px) scaleX(0.8); }
        }
        @keyframes lidBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
      {/* Steam lines */}
      <span style={{
        position: 'absolute', top: -6, left: 8, width: 3, height: 6,
        borderRadius: 4, background: 'rgba(234,140,46,0.5)',
        animation: 'steam1 1.4s ease-in-out infinite',
      }} />
      <span style={{
        position: 'absolute', top: -8, left: 14, width: 3, height: 8,
        borderRadius: 4, background: 'rgba(234,140,46,0.4)',
        animation: 'steam2 1.4s ease-in-out infinite 0.3s',
      }} />
      <span style={{
        position: 'absolute', top: -6, left: 20, width: 3, height: 6,
        borderRadius: 4, background: 'rgba(234,140,46,0.5)',
        animation: 'steam1 1.4s ease-in-out infinite 0.6s',
      }} />
      <span style={{ animation: 'lidBounce 1.4s ease-in-out infinite', display: 'inline-block' }}>
        🍲
      </span>
    </span>
  );
}

function GroceriesIcon() {
  return (
    <span className="relative w-10 h-10 flex items-center justify-center text-2xl">
      <style>{`
        @keyframes basketSwing {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
        }
        @keyframes itemBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
      <span style={{ animation: 'basketSwing 2s ease-in-out infinite', display: 'inline-block', transformOrigin: 'top center' }}>
        🧺
      </span>
      {/* Small bouncing item above basket */}
      <span style={{
        position: 'absolute', top: -4, right: 0, fontSize: 10,
        animation: 'itemBounce 1s ease-in-out infinite 0.2s',
      }}>
        🥕
      </span>
    </span>
  );
}

function PharmacyIcon() {
  return (
    <span className="relative w-10 h-10 flex items-center justify-center text-2xl">
      <style>{`
        @keyframes pillFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-4px) rotate(10deg); }
          66% { transform: translateY(-2px) rotate(-5deg); }
        }
        @keyframes plusPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
      <span style={{ animation: 'pillFloat 2s ease-in-out infinite', display: 'inline-block' }}>
        💊
      </span>
      {/* Pulsing plus sign */}
      <span style={{
        position: 'absolute', top: -2, right: -2, fontSize: 10,
        color: 'rgba(20,184,166,0.9)', fontWeight: 'bold',
        animation: 'plusPulse 1.2s ease-in-out infinite',
      }}>
        ✚
      </span>
    </span>
  );
}

function VegFruitsIcon() {
  return (
    <span className="relative w-10 h-10 flex items-center justify-center text-2xl">
      <style>{`
        @keyframes leafSway {
          0%, 100% { transform: rotate(-8deg) translateY(0); }
          50% { transform: rotate(8deg) translateY(-2px); }
        }
        @keyframes fruitDrop {
          0%, 80%, 100% { transform: translateY(0); }
          90% { transform: translateY(3px); }
        }
      `}</style>
      <span style={{ animation: 'fruitDrop 2s ease-in-out infinite', display: 'inline-block' }}>
        🍅
      </span>
      <span style={{
        position: 'absolute', top: -4, left: 0, fontSize: 14,
        animation: 'leafSway 1.8s ease-in-out infinite',
        display: 'inline-block',
        transformOrigin: 'bottom center',
      }}>
        🥬
      </span>
    </span>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { getCartItemCount } = useCart();
  const isTeluguActive = language === 'te';
  const cartCount = getCartItemCount();

  const rawName =
    profile?.display_name ||
    localStorage.getItem('mana-angadi-user-name') ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Guest');
  const displayName = rawName;

  const tabClass = (active: boolean) =>
    `flex flex-col items-center gap-1 ${active ? 'text-primary' : 'opacity-30'}`;
  const labelClass = 'text-[9px] uppercase tracking-widest font-bold';

  const categories = [
    {
      icon: <FoodIcon />,
      label: t.food,
      category: 'food',
      bg: 'rgba(234,140,46,0.12)',
      border: 'rgba(234,140,46,0.35)',
      ring: 'rgba(234,140,46,0.25)',
    },
    {
      icon: <GroceriesIcon />,
      label: t.groceries,
      category: 'groceries',
      bg: 'rgba(139,90,43,0.12)',
      border: 'rgba(139,90,43,0.35)',
      ring: 'rgba(139,90,43,0.25)',
    },
    {
      icon: <PharmacyIcon />,
      label: t.pharmacy,
      category: 'pharmacy',
      bg: 'rgba(20,184,166,0.12)',
      border: 'rgba(20,184,166,0.35)',
      ring: 'rgba(20,184,166,0.25)',
    },
    {
      icon: <VegFruitsIcon />,
      label: t.fruitsAndVeg,
      category: 'vegfruits',
      bg: 'rgba(45,185,45,0.12)',
      border: 'rgba(45,185,45,0.35)',
      ring: 'rgba(45,185,45,0.25)',
    },
  ];

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
                {t.namaskaram}, <br />{formatHonorific(displayName, language)}
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
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=300&fit=crop"
                alt={language === 'te' ? 'ఉదయపు ఆకుకూరలు' : 'Morning Greens Basket'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-[9px] uppercase tracking-tighter opacity-80">
                  {language === 'te' ? 'స్థానిక పంట' : 'Local Grown'}
                </p>
                <p className="text-base font-medium">
                  {language === 'te' ? 'ఉదయపు ఆకుకూరల బుట్ట' : 'Morning Greens Basket'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-none w-64">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-foreground/5">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&h=300&fit=crop"
                alt={language === 'te' ? 'బంగినపల్లి మామిడి' : 'Banganapalli Gold'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-[9px] uppercase tracking-tighter opacity-80">
                  {language === 'te' ? 'స్థానిక పంట' : 'Local Grown'}
                </p>
                <p className="text-base font-medium">
                  {language === 'te' ? 'బంగినపల్లి గోల్డ్' : 'Banganapalli Gold'}
                </p>
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
          {categories.map(({ icon, label, category, bg, border, ring }) => (
            <button
              key={category}
              onClick={() => navigate(`/category/${category}`)}
              className="flex items-center gap-3 py-3 px-4 rounded-xl shadow-sm active:scale-[0.97] transition-transform touch-manipulation cursor-pointer bg-mana-cream/90"
              style={{ border: `1.5px solid ${border}` }}
            >
              <span className="relative flex-shrink-0">
                {/* Bloom ring behind icon */}
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: ring,
                    width: 48,
                    height: 48,
                    top: -4,
                    left: -4,
                    animation: 'bloom-outer 3s ease-in-out infinite',
                  }}
                />
                {/* Icon background circle */}
                <span
                  className="relative w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: bg }}
                >
                  {icon}
                </span>
              </span>
              <span className="text-[13px] font-sans font-bold text-foreground/90 leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. COMMUNITY NOTICE */}
      <section className="px-6 mt-8 mb-4">
        <div className="card-notice">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">
              {t.communityLabel}
            </span>
          </div>
          <p className="text-sm italic leading-relaxed text-foreground/80 mb-3">
            {t.communityMessage}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-foreground/10 border-2 border-white" />
              ))}
            </div>
            <span className="text-[7px] font-bold bg-mana-charcoal text-white w-4 h-4 rounded-full flex items-center justify-center">
              +12
            </span>
            <span className="text-[10px] opacity-50 ml-1">{t.neighboursJoined}</span>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-mana-cream/95 backdrop-blur-md border-t border-foreground/5 px-8 pt-3 pb-6 z-50">
        <div className="flex justify-between items-end">
          <button onClick={() => navigate('/home')} className={tabClass(true)}>
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