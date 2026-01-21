import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAddress } from '@/context/AddressContext';
import { useShop } from '@/hooks/useShops';
import { useCreateOrder } from '@/hooks/useOrders';
import { getLocalizedName } from '@/data/mockData';
import { calculateDistanceKm, calculateDeliveryFee, calculateETA, PaymentMethod, CustomerAddress } from '@/types';
import { ArrowLeft, Plus, Minus, Trash2, Package, MapPin, ChevronRight, Lock } from 'lucide-react';
import { AddressPicker } from '@/components/address/AddressPicker';
import { PaymentSelector } from '@/components/checkout/PaymentSelector';
import { DeliveryFeeCard } from '@/components/checkout/DeliveryFeeCard';
import { toast } from 'sonner';

export function CartPage() {
  const navigate = useNavigate();
  const { cart, cartShopId, updateQuantity, removeFromCart, getCartTotal, clearCart } = useApp();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { getDefaultAddress } = useAddress();
  
  const [note, setNote] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | undefined>(getDefaultAddress());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [codChangeNeeded, setCodChangeNeeded] = useState<number | undefined>();
  const [upiTxnRef, setUpiTxnRef] = useState('');

  // Fetch shop from database
  const { data: shop } = useShop(cartShopId);
  const createOrder = useCreateOrder();

  const subtotal = getCartTotal();

  // Calculate delivery fee and ETA
  const pickupLat = shop?.pickupLat ?? 18.8305;
  const pickupLng = shop?.pickupLng ?? 78.6098;
  const dropLat = selectedAddress?.lat ?? 18.7892;
  const dropLng = selectedAddress?.lng ?? 78.5723;
  const distanceKm = calculateDistanceKm(pickupLat, pickupLng, dropLat, dropLng);
  const { fee: deliveryFee, freeDelivery } = calculateDeliveryFee(shop?.type || 'kirana', distanceKm, subtotal);
  const eta = calculateETA(distanceKm);
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!shop || cart.length === 0 || !user) {
      toast.error(language === 'en' ? 'Unable to place order' : 'ఆర్డర్ చేయలేకపోయాము');
      return;
    }

    // Validation: ensure all items are from the same shop
    const shopIds = [...new Set(cart.map(item => item.product.shopId))];
    if (shopIds.length > 1 || (shopIds.length === 1 && shopIds[0] !== shop.id)) {
      toast.error(language === 'en' ? 'Please order from one shop at a time' : 'ఒక దుకాణం నుండి మాత్రమే ఆర్డర్ చేయండి');
      return;
    }

    setIsPlacing(true);
    
    try {
      const order = await createOrder.mutateAsync({
        userId: user.id,
        shopId: shop.id,
        shopNameTe: shop.name_te,
        shopNameEn: shop.name_en,
        shopPickupLat: shop.pickupLat,
        shopPickupLng: shop.pickupLng,
        items: cart.map(item => ({
          productId: item.product.id,
          productNameTe: item.product.name_te,
          productNameEn: item.product.name_en,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.image,
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        codChangeNeededFor: codChangeNeeded,
        upiTxnRef: paymentMethod === 'UPI' ? upiTxnRef : undefined,
        addressId: selectedAddress?.id,
        addressTextTe: selectedAddress ? `${selectedAddress.label_te}, ${selectedAddress.landmark_te}` : undefined,
        addressTextEn: selectedAddress ? `${selectedAddress.label_en}, ${selectedAddress.landmark_en}` : undefined,
        dropLat: selectedAddress?.lat,
        dropLng: selectedAddress?.lng,
        deliveryInstructionsTe: selectedAddress?.deliveryInstructions_te,
        deliveryInstructionsEn: selectedAddress?.deliveryInstructions_en,
        approxDistanceKm: distanceKm,
        etaMin: eta?.min,
        etaMax: eta?.max,
        note,
      });
      
      clearCart();
      navigate('/order-success', { state: { orderId: order.id } });
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.error(language === 'en' ? 'Failed to place order. Please try again.' : 'ఆర్డర్ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.');
    } finally {
      setIsPlacing(false);
    }
  };

  const getProductName = (product: { name_te: string; name_en: string }) => {
    return language === 'en' ? product.name_en : product.name_te;
  };

  const labels = {
    deliveryAddress: language === 'en' ? 'Delivery Address' : 'డెలివరీ చిరునామా',
    addAddress: language === 'en' ? 'Add Address' : 'చిరునామా జోడించండి',
    change: language === 'en' ? 'Change' : 'మార్చు',
    privacyNote: language === 'en' ? 'Your address is private' : 'మీ చిరునామా గోప్యంగా ఉంటుంది',
  };

  // Show loading while shop data loads
  if (cartShopId && !shop) {
    return (
      <div className="mobile-container min-h-screen flex flex-col bg-background items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{language === 'en' ? 'Loading...' : 'లోడ్ అవుతోంది...'}</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mobile-container min-h-screen flex flex-col bg-background">
        <header className="screen-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-bold text-lg text-foreground">{t.yourOrder}</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <Trash2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center text-lg">{t.emptyCart}</p>
          <button onClick={() => navigate('/home')} className="btn-primary mt-6">{t.navHome}</button>
        </div>
      </div>
    );
  }

  const shopName = shop ? getLocalizedName(shop, language) : '';
  const addressLabel = selectedAddress 
    ? (language === 'en' ? selectedAddress.label_en : selectedAddress.label_te)
    : null;
  const addressLandmark = selectedAddress 
    ? (language === 'en' ? selectedAddress.landmark_en : selectedAddress.landmark_te)
    : null;

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
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
            {shop && <p className="text-muted-foreground text-sm">{shopName}</p>}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto pb-40">
        {/* Cart Items */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {cart.map(item => (
            <div key={item.product.id} className="product-row px-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {item.product.image ? (
                  <img src={item.product.image} alt={getProductName(item.product)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 px-3">
                <h4 className="font-medium text-foreground">{getProductName(item.product)}</h4>
                <p className="text-primary font-semibold mt-0.5">₹{item.product.price} × {item.quantity} = ₹{item.product.price * item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="qty-btn"><Minus className="w-4 h-4" /></button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="qty-btn bg-primary text-primary-foreground"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground">{labels.deliveryAddress}</span>
            <div className="flex items-center gap-1 text-xs text-primary">
              <Lock className="w-3 h-3" />
              <span>{labels.privacyNote}</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddressPicker(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              {selectedAddress ? (
                <>
                  <p className="font-medium text-foreground truncate">{addressLabel}</p>
                  <p className="text-sm text-muted-foreground truncate">{addressLandmark}</p>
                </>
              ) : (
                <p className="text-muted-foreground">{labels.addAddress}</p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Delivery Fee Card */}
        {shop && (
          <DeliveryFeeCard
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            distanceKm={distanceKm}
            etaMin={eta?.min}
            etaMax={eta?.max}
            shopType={shop.type}
            freeDelivery={freeDelivery}
          />
        )}

        {/* Delivery Note */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="text-sm text-muted-foreground mb-2 block">{t.deliveryNote}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.deliveryNote}
            className="w-full px-3 py-2 rounded-xl border border-border resize-none h-20 focus:outline-none focus:border-primary bg-background"
          />
        </div>

        {/* Payment Section */}
        {shop && (
          <PaymentSelector
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            codChangeNeeded={codChangeNeeded}
            onCodChangeChange={setCodChangeNeeded}
            upiTxnRef={upiTxnRef}
            onUpiTxnRefChange={setUpiTxnRef}
            shopType={shop.type}
          />
        )}
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 border-t border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg text-muted-foreground">{t.total}</span>
          <span className="text-2xl font-bold text-foreground">₹{total}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isPlacing ? <span className="animate-pulse">{t.placeOrder}...</span> : t.placeOrder}
        </button>
      </div>

      {/* Address Picker Modal */}
      {showAddressPicker && (
        <AddressPicker
          onClose={() => setShowAddressPicker(false)}
          onSelect={(addr) => setSelectedAddress(addr)}
        />
      )}
    </div>
  );
}
