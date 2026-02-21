import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Plus, Minus, X, Package, Truck } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=60';

export function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { language } = useLanguage();

  const en = language === 'en';
  const subtotal = getCartTotal();
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  // ── EMPTY STATE ──
  if (cart.length === 0) {
    return (
      <div className="screen-shell min-h-screen flex flex-col bg-background">
        <div className="pt-12 px-5 pb-4">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="flex-1 text-center font-display text-2xl font-semibold text-foreground">
              {en ? 'Your Basket' : 'మీ బుట్ట'}
            </h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <Package className="w-9 h-9 text-primary" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            {en ? 'Your basket is empty' : 'మీ బుట్ట ఖాళీగా ఉంది'}
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-8">
            {en ? 'Add items from your village shops.' : 'మీ గ్రామ దుకాణాల నుండి వస్తువులు జోడించండి.'}
          </p>
          <button onClick={() => navigate('/home')} className="btn-primary-pill px-8 py-3 text-sm font-semibold">
            {en ? 'Browse Shops' : 'దుకాణాలు చూడండి'}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="screen-shell min-h-screen flex flex-col bg-background">
      {/* ── HEADER ── */}
      <div className="pt-12 px-5 pb-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center font-display text-2xl font-semibold text-foreground">
            {en ? 'Your Basket' : 'మీ బుట్ట'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-56 space-y-5 hide-scrollbar">
        {/* ── CART ITEMS ── */}
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-card rounded-xl shadow-sm border border-foreground/5 p-4 flex gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={item.item_image_url || FALLBACK_IMAGE}
                  alt={item.item_name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground leading-tight">{item.item_name}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full active:scale-95 transition-transform flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground italic mt-0.5">
                    {en ? `From: ${item.shop_name}` : `నుండి: ${item.shop_name}`}
                  </p>
                </div>

                {/* Bottom: price + stepper */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-foreground">
                    ₹{item.item_price * item.quantity}
                  </span>
                  <div className="flex items-center gap-1 bg-primary/10 rounded-full h-10 px-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Minus className="w-4 h-4 text-foreground" />
                    </button>
                    <span className="w-7 text-center font-bold text-sm text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── SUMMARY ── */}
        <div className="bg-card rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex justify-between text-sm text-foreground">
            <span>{en ? 'Subtotal' : 'ఉప మొత్తం'}</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">{en ? 'Village Delivery Fee' : 'గ్రామ డెలివరీ రుసుము'}</span>
            <span className="text-primary font-medium">₹{deliveryFee}</span>
          </div>
          <div className="border-t border-dashed border-foreground/10 my-1" />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">{en ? 'Total' : 'మొత్తం'}</span>
            <span className="text-2xl font-bold text-foreground">₹{total}</span>
          </div>
        </div>

        {/* ── DELIVERY NOTE ── */}
        <div className="flex items-center gap-3 px-1">
          <Truck className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm italic text-muted-foreground">
            {en ? 'Delivering fresh to your village.' : 'మీ గ్రామానికి తాజాగా డెలివరీ.'}
          </p>
        </div>
      </div>

      {/* ── CHECKOUT CTA ── */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-5 z-40">
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-primary text-primary-foreground font-semibold text-base py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          {en ? 'Proceed to Checkout' : 'చెక్‌అవుట్‌కు వెళ్ళండి'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
