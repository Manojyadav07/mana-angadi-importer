import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { useShop } from '@/hooks/useShops';
import { getLocalizedName } from '@/data/mockData';
import { calculateDistanceKm, calculateDeliveryFee } from '@/types';
import { ArrowLeft, Plus, Minus, X, Package, Truck } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';

export function BasketPage() {
  const navigate = useNavigate();
  const { cart, cartShopId, updateQuantity, removeFromCart, getCartTotal, getCartItemCount } = useApp();
  const { language } = useLanguage();
  const { data: shop } = useShop(cartShopId);

  const subtotal = getCartTotal();

  // Calculate delivery fee
  const pickupLat = shop?.pickupLat ?? 18.8305;
  const pickupLng = shop?.pickupLng ?? 78.6098;
  const dropLat = 18.7892;
  const dropLng = 78.5723;
  const distanceKm = calculateDistanceKm(pickupLat, pickupLng, dropLat, dropLng);
  const { fee: deliveryFee } = calculateDeliveryFee(shop?.type || 'kirana', distanceKm, subtotal);
  const total = subtotal + deliveryFee;

  const getProductName = (product: { name_te: string; name_en: string }) =>
    language === 'en' ? product.name_en : product.name_te;

  const shopName = shop ? getLocalizedName(shop, language) : '';

  // Empty state
  if (cart.length === 0) {
    return (
      <MobileLayout showNav={true}>
        <div className="min-h-screen bg-mana-cream flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-mana-cream/95 backdrop-blur-md border-b border-mana-charcoal/5 px-4 pt-12 pb-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-mana-charcoal/5 flex items-center justify-center active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-5 h-5 text-mana-charcoal" />
              </button>
              <h1 className="font-display text-2xl font-semibold text-mana-charcoal">
                {language === 'en' ? 'Your Basket' : 'మీ బుట్ట'}
              </h1>
              <div className="w-10" />
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Package className="w-9 h-9 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold text-mana-charcoal mb-2">
              {language === 'en' ? 'Your basket is waiting' : 'మీ బుట్ట ఖాళీగా ఉంది'}
            </h2>
            <p className="text-mana-charcoal/60 text-center text-sm">
              {language === 'en' ? 'Add items from your village shops.' : 'మీ గ్రామ దుకాణాల నుండి వస్తువులు జోడించండి.'}
            </p>
            <button
              onClick={() => navigate('/categories')}
              className="mt-8 px-8 py-3.5 rounded-full bg-primary text-white font-semibold shadow-md shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              {language === 'en' ? 'Explore Categories' : 'వర్గాలు చూడండి'}
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={true}>
      <div className="min-h-screen bg-mana-cream flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-mana-cream/95 backdrop-blur-md border-b border-mana-charcoal/5 px-4 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-mana-charcoal/5 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-mana-charcoal" />
            </button>
            <h1 className="font-display text-2xl font-semibold text-mana-charcoal">
              {language === 'en' ? 'Your Basket' : 'మీ బుట్ట'}
            </h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex-1 px-4 pt-4 pb-48 space-y-5 overflow-y-auto">
          {/* Shop context */}
          {shopName && (
            <p className="font-display italic text-sm text-mana-charcoal/50 px-1">
              {language === 'en' ? `From: ${shopName}` : `నుండి: ${shopName}`}
            </p>
          )}

          {/* Cart Items */}
          <div className="space-y-4">
            {cart.map(item => {
              const quantity = item.quantity;
              const productName = getProductName(item.product);
              const unitLabel = language === 'en' ? item.product.unit_en : item.product.unit_te;

              return (
                <div
                  key={item.product.id}
                  className="bg-white rounded-xl shadow-sm p-4 flex gap-4"
                >
                  {/* Square thumbnail */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-mana-charcoal/5 flex-shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-mana-charcoal/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-semibold text-mana-charcoal leading-tight">
                          {productName}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-mana-charcoal/40 hover:text-mana-charcoal/70 transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {unitLabel && (
                        <p className="text-xs italic text-mana-charcoal/50 mt-0.5">{unitLabel}</p>
                      )}
                    </div>

                    {/* Bottom row: price + stepper */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-mana-charcoal">
                        ₹{item.product.price * quantity}
                      </span>

                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1 bg-primary/10 rounded-full h-10 px-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, quantity - 1)}
                          className="w-8 h-8 rounded-full border border-mana-charcoal/10 flex items-center justify-center active:scale-95 transition-transform"
                        >
                          <Minus className="w-4 h-4 text-mana-charcoal" />
                        </button>
                        <span className="w-7 text-center font-bold text-sm text-mana-charcoal">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, quantity + 1)}
                          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform"
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

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            <div className="flex justify-between text-sm text-mana-charcoal/70">
              <span>{language === 'en' ? 'Subtotal' : 'ఉప మొత్తం'}</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mana-charcoal/70">
                {language === 'en' ? 'Village Delivery Fee' : 'గ్రామ డెలివరీ ఛార్జ్'}
              </span>
              <span className="text-primary font-medium">₹{deliveryFee}</span>
            </div>
            <div className="border-t border-dashed border-mana-charcoal/10 pt-3 flex justify-between items-center">
              <span className="font-semibold text-mana-charcoal">
                {language === 'en' ? 'Total' : 'మొత్తం'}
              </span>
              <span className="text-2xl font-bold text-mana-charcoal">₹{total}</span>
            </div>
          </div>

          {/* Delivery note */}
          <div className="flex items-center gap-3 px-1">
            <Truck className="w-5 h-5 text-mana-charcoal/40 flex-shrink-0" />
            <p className="text-xs italic text-mana-charcoal/50">
              {language === 'en'
                ? 'Delivering fresh to your village within 24 hours.'
                : 'మీ గ్రామానికి 24 గంటల్లో తాజాగా డెలివరీ.'}
            </p>
          </div>
        </div>

        {/* Checkout CTA */}
        <div className="fixed bottom-[88px] left-0 right-0 max-w-md mx-auto px-4 pb-4 z-40">
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-4 rounded-full bg-primary text-white font-semibold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            {language === 'en' ? 'Proceed to Checkout' : 'చెక్‌అవుట్‌కి వెళ్ళండి'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
