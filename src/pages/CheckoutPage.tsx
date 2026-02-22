import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, refetch } = useCart();
  const { user } = useAuth();
  const { language } = useLanguage();
  const createOrder = useCreateOrder();

  const [isPlacing, setIsPlacing] = useState(false);

  const en = language === 'en';
  const subtotal = getCartTotal();
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error(en ? 'Please log in' : 'దయచేసి లాగిన్ అవ్వండి');
      return;
    }
    if (cart.length === 0) {
      toast.error(en ? 'Your basket is empty' : 'మీ బుట్ట ఖాళీగా ఉంది');
      return;
    }

    setIsPlacing(true);
    try {
      const result = await createOrder.mutateAsync({
        userId: user.id,
        cartItems: cart.map(c => ({
          item_id: c.item_id,
          shop_id: c.shop_id,
          quantity: c.quantity,
          item_price: c.item_price,
          item_name: c.item_name,
          shop_name: c.shop_name,
        })),
      });

      refetch(); // refresh cart (should be empty now)
      navigate('/order-success', {
        state: {
          orderIds: result.orderIds,
          shopNames: result.shopNames,
          totals: result.totals,
        },
      });
    } catch (err: any) {
      console.error('Order failed:', err);
      toast.error(en ? 'Failed to place order. Please try again.' : 'ఆర్డర్ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.');
    } finally {
      setIsPlacing(false);
    }
  };

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="screen-shell min-h-screen flex flex-col bg-background items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <Package className="w-9 h-9 text-primary" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          {en ? 'Your basket is empty' : 'మీ బుట్ట ఖాళీగా ఉంది'}
        </h2>
        <button onClick={() => navigate('/home')} className="btn-primary-pill px-8 py-3 text-sm font-semibold mt-6">
          {en ? 'Browse Shops' : 'అంగడులు చూడండి'}
        </button>
      </div>
    );
  }

  const FALLBACK = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=60';

  return (
    <div className="screen-shell min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-foreground/5">
        <div className="pt-12 px-5 pb-4">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="flex-1 text-center font-display text-2xl font-semibold text-foreground">
              {en ? 'Checkout' : 'చెక్‌అవుట్'}
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-40 space-y-5 pt-5">
        {/* Order Summary */}
        <div className="bg-card rounded-xl shadow-sm p-5">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
            {en ? 'Order Summary' : 'ఆర్డర్ సారాంశం'}
          </p>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.item_image_url || FALLBACK}
                    alt={item.item_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.item_name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} × ₹{item.item_price}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">₹{item.item_price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-foreground/5 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Subtotal' : 'ఉప మొత్తం'}</span>
              <span className="text-foreground">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Village Delivery Fee' : 'గ్రామ డెలివరీ రుసుము'}</span>
              <span className="text-primary font-medium">₹{deliveryFee}</span>
            </div>
            <div className="border-t border-dashed border-foreground/10 my-1" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">{en ? 'Total' : 'మొత్తం'}</span>
              <span className="text-2xl font-bold text-foreground">₹{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-md border-t border-foreground/5 px-5 py-4 pb-8 z-40">
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className="w-full bg-primary text-primary-foreground font-semibold text-base py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          {isPlacing
            ? (en ? 'Placing Order...' : 'ఆర్డర్ చేస్తోంది...')
            : (en ? 'Place Order' : 'ఆర్డర్ చేయండి')}
        </button>
      </div>
    </div>
  );
}
