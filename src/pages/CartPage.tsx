import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getShopById } from '@/data/mockData';
import { ArrowLeft, Plus, Minus, Trash2, Banknote } from 'lucide-react';

export function CartPage() {
  const navigate = useNavigate();
  const { cart, cartShopId, updateQuantity, removeFromCart, getCartTotal, placeOrder } = useApp();
  const { t } = useLanguage();
  const [note, setNote] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const shop = cartShopId ? getShopById(cartShopId) : undefined;
  const total = getCartTotal();

  const handlePlaceOrder = async () => {
    if (!shop || cart.length === 0) return;

    setIsPlacing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const order = placeOrder(shop.id, shop.name, note);
    setIsPlacing(false);
    navigate('/order-success', { state: { orderId: order.id } });
  };

  if (cart.length === 0) {
    return (
      <div className="mobile-container min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="screen-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-bold text-lg text-foreground">
              {t.yourOrder}
            </h1>
          </div>
        </header>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <Trash2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center text-lg">
            {t.emptyCart}
          </p>
          <button
            onClick={() => navigate('/home')}
            className="btn-primary mt-6"
          >
            {t.navHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="screen-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-foreground">{t.yourOrder}</h1>
            {shop && (
              <p className="text-muted-foreground text-sm">{shop.name}</p>
            )}
          </div>
        </div>
      </header>

      {/* Cart Items */}
      <div className="flex-1 px-4 py-4 space-y-3">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {cart.map(item => (
            <div key={item.product.id} className="product-row px-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{item.product.name}</h4>
                <p className="text-primary font-semibold mt-0.5">
                  ₹{item.product.price} × {item.quantity} = ₹{item.product.price * item.quantity}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="qty-btn"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="qty-btn bg-primary text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Note */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            {t.deliveryNote}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.deliveryNote}
            className="w-full px-3 py-2 rounded-xl border border-border resize-none h-20 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Payment Info */}
        <div className="bg-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <Banknote className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">{t.paymentNote}</p>
            <p className="text-sm text-muted-foreground">
              {t.paymentNote}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-4 pb-8 pt-4 border-t border-border bg-card">
        {/* Total */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg text-muted-foreground">{t.total}</span>
          <span className="text-2xl font-bold text-foreground">₹{total}</span>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isPlacing ? (
            <span className="animate-pulse">{t.placeOrder}...</span>
          ) : (
            t.placeOrder
          )}
        </button>
      </div>
    </div>
  );
}
