import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useShop } from '@/hooks/useShops';
import { getLocalizedName } from '@/data/mockData';
import { ArrowLeft, Plus, Minus, X, Package, Truck } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';

export function CartPage() {
  const navigate = useNavigate();
  const { cart, cartShopId, updateQuantity, removeFromCart, getCartTotal, getCartItemCount } = useCart();
  const { user } = useAuth();
  const { language } = useLanguage();

  const { data: shop } = useShop(cartShopId);

  const subtotal = getCartTotal();
  const deliveryFee = 15;
  const total = subtotal + deliveryFee;

  const getProductName = (product: { name_te: string; name_en: string }) =>
    language === 'en' ? product.name_en : product.name_te;

  // ── EMPTY STATE ──
  if (cart.length === 0) {
    return (
      <div className="screen-shell min-h-screen flex flex-col bg-background">
        <div className="pt-12 px-5 pb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="flex-1 text-center font-display text-2xl font-semibold text-foreground">
              {language === 'en' ? 'Your Basket' : 'మీ బుట్ట'}
            </h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <Package className="w-9 h-9 text-primary" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            {language === 'en' ? 'Your basket is waiting' : 'మీ బుట్ట ఖాళీగా ఉంది'}
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-8">
            {language === 'en' ? 'Add items from your village shops.' : 'మీ గ్రామ దుకాణాల నుండి వస్తువులు జోడించండి.'}
          </p>
          <button
            onClick={() => navigate('/categories')}
            className="btn-primary-pill px-8 py-3 text-sm font-semibold"
          >
            {language === 'en' ? 'Explore Categories' : 'వర్గాలు చూడండి'}
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  const shopName = shop ? getLocalizedName(shop, language) : '';

  return (
    <div className="screen-shell min-h-screen flex flex-col bg-background">
      {/* ── 1. HEADER ── */}
      <div className="pt-12 px-5 pb-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center font-display text-2xl font-semibold text-foreground">
            {language === 'en' ? 'Your Basket' : 'మీ బుట్ట'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-56 space-y-5">
        {/* ── 2. SHOP CONTEXT ── */}
        {shopName && (
          <p className="font-display italic text-sm text-muted-foreground">
            {language === 'en' ? `From: ${shopName}` : `నుండి: ${shopName}`}
          </p>
        )}

        {/* ── 3. CART ITEMS ── */}
        <div className="space-y-4">
          {cart.map(item => {
            const quantity = item.quantity;
            const productName = getProductName(item.product);
            const unit = language === 'en' ? item.product.unit_en : item.product.unit_te;

            return (
              <div
                key={item.product_id}
                className="bg-card rounded-xl shadow-sm p-4 flex gap-4"
              >
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground leading-tight">{productName}</h3>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full active:scale-95 transition-transform flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    {unit && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">{unit}</p>
                    )}
                  </div>

                  {/* Bottom: price + stepper */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-foreground">
                      ₹{item.product.price * quantity}
                    </span>

                    <div className="flex items-center gap-1 bg-primary/10 rounded-full h-10 px-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, quantity - 1)}
                        className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Minus className="w-4 h-4 text-foreground" />
                      </button>
                      <span className="w-7 text-center font-bold text-sm text-foreground">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, quantity + 1)}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 5. SUMMARY ── */}
        <div className="bg-card rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex justify-between text-sm text-foreground">
            <span>{language === 'en' ? 'Subtotal' : 'ఉప మొత్తం'}</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">{language === 'en' ? 'Village Delivery Fee' : 'గ్రామ డెలివరీ రుసుము'}</span>
            <span className="text-primary font-medium">₹{deliveryFee}</span>
          </div>
          <div className="border-t border-dashed border-foreground/10 my-1" />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">{language === 'en' ? 'Total' : 'మొత్తం'}</span>
            <span className="text-2xl font-bold text-foreground">₹{total}</span>
          </div>
        </div>

        {/* ── 6. DELIVERY NOTE ── */}
        <div className="flex items-center gap-3 px-1">
          <Truck className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm italic text-muted-foreground">
            {language === 'en' ? 'Delivering fresh to your village.' : 'మీ గ్రామానికి తాజాగా డెలివరీ.'}
          </p>
        </div>
      </div>

      {/* ── 7. CHECKOUT CTA ── */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-5 z-40">
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-primary text-primary-foreground font-semibold text-base py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          {language === 'en' ? 'Proceed to Checkout' : 'చెక్‌అవుట్‌కు వెళ్ళండి'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
