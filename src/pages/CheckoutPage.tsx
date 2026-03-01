import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useOrderTotals } from '@/hooks/useOrderTotals';
import { ArrowLeft, Package, Banknote, CreditCard, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, refetch } = useCart();
  const { user } = useAuth();
  const { language } = useLanguage();
  const createOrder = useCreateOrder();

  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [changeFor, setChangeFor] = useState<number | null>(null);

  const en = language === 'en';
  const subtotal = getCartTotal();

  // Server-side delivery fee from calculate_order_totals RPC
  const { data: totals, isLoading: totalsLoading, error: totalsError } = useOrderTotals(user?.id, subtotal);
  const deliveryFee = totals?.delivery_fee ?? 0;
  const minOrder = totals?.min_order ?? 0;
  const total = totals?.total_amount ?? subtotal;

  const handlePaymentChange = (method: 'cod' | 'upi') => {
    setPaymentMethod(method);
    if (method === 'upi') setChangeFor(null);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error(en ? 'Please log in' : 'దయచేసి లాగిన్ అవ్వండి');
      return;
    }
    if (cart.length === 0) {
      toast.error(en ? 'Your basket is empty' : 'మీ బుట్ట ఖాళీగా ఉంది');
      return;
    }
    if (!totals) {
      toast.error(en ? 'Please set your delivery village in Profile' : 'దయచేసి మీ గ్రామాన్ని ప్రొఫైల్‌లో సెట్ చేయండి');
      return;
    }
    if (subtotal < minOrder) {
      toast.error(en ? `Minimum order for your village is ₹${minOrder}` : `మీ గ్రామానికి కనీస ఆర్డర్ ₹${minOrder}`);
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
        paymentMethod,
        cashChangeFor: changeFor,
        deliveryFee: totals.delivery_fee,
        villageId: totals.village_id,
      });

      refetch();

      if (result.deliveryWarnings && result.deliveryWarnings.length > 0) {
        toast.info(en
          ? 'All delivery partners are currently busy. Your order will be assigned shortly.'
          : 'అన్ని డెలివరీ భాగస్వాములు ప్రస్తుతం బిజీగా ఉన్నారు. మీ ఆర్డర్ త్వరలో కేటాయించబడుతుంది.');
      }

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
  const changeOptions = [
    { value: null, label: en ? 'None' : 'వద్దు' },
    { value: 200, label: '₹200' },
    { value: 500, label: '₹500' },
    { value: 1000, label: '₹1000' },
  ];

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
        {/* Village not set warning */}
        {totalsError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">
                {en ? 'Delivery location not set' : 'డెలివరీ స్థలం సెట్ చేయలేదు'}
              </p>
              <p className="text-xs text-destructive/80 mt-1">
                {en ? 'Please update your village in Profile to proceed.' : 'కొనసాగించడానికి ప్రొఫైల్‌లో మీ గ్రామాన్ని అప్‌డేట్ చేయండి.'}
              </p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
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

          {/* Min order warning */}
          {subtotal < minOrder && minOrder > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">
                {en
                  ? `Minimum order for your village is ₹${minOrder}. Add ₹${minOrder - subtotal} more.`
                  : `మీ గ్రామానికి కనీస ఆర్డర్ ₹${minOrder}. ₹${minOrder - subtotal} మరింత జోడించండి.`}
              </p>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-foreground/5 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Subtotal' : 'ఉప మొత్తం'}</span>
              <span className="text-foreground">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Village Delivery Fee' : 'గ్రామ డెలివరీ రుసుము'}</span>
              <span className="text-primary font-medium">
                {totalsLoading ? '...' : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="border-t border-dashed border-foreground/10 my-1" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">{en ? 'Total' : 'మొత్తం'}</span>
              <span className="text-2xl font-bold text-foreground">
                {totalsLoading ? '...' : `₹${total}`}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
            {en ? 'Payment Method' : 'చెల్లింపు విధానం'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePaymentChange('cod')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'cod'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paymentMethod === 'cod' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Banknote className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {en ? 'Cash on Delivery' : 'డెలివరీ నగదు'}
              </span>
              {paymentMethod === 'cod' && <Check className="w-4 h-4 text-primary" />}
            </button>
            <button
              onClick={() => handlePaymentChange('upi')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'upi'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paymentMethod === 'upi' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {en ? 'UPI Payment' : 'UPI చెల్లింపు'}
              </span>
              {paymentMethod === 'upi' && <Check className="w-4 h-4 text-primary" />}
            </button>
          </div>
        </div>

        {/* Change chips (COD only) */}
        {paymentMethod === 'cod' && (
          <div className="bg-card rounded-2xl shadow-sm p-5">
            <p className="text-sm font-medium text-foreground mb-3">
              {en ? 'Need change for?' : 'చిల్లర కావాలి?'}
            </p>
            <div className="flex flex-wrap gap-2">
              {changeOptions.map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setChangeFor(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    changeFor === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-md border-t border-foreground/5 px-5 py-4 pb-8 z-40">
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing || !totals || (minOrder > 0 && subtotal < minOrder)}
          className="w-full bg-primary text-primary-foreground font-semibold text-base py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          {isPlacing
            ? (en ? 'Placing Order...' : 'ఆర్డర్ చేస్తోంది...')
            : totalsLoading
              ? (en ? 'Calculating...' : 'లెక్కిస్తోంది...')
              : (en ? `Place Order · ₹${total}` : `ఆర్డర్ చేయండి · ₹${total}`)}
        </button>
      </div>
    </div>
  );
}
