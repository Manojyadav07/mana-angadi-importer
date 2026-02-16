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
import { ArrowLeft, Package, MapPin, Banknote, CreditCard, Check, Copy, Upload, QrCode } from 'lucide-react';
import { AddressPicker } from '@/components/address/AddressPicker';
import { toast } from 'sonner';
import { SUPPORT_CONFIG } from '@/types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartShopId, getCartTotal, clearCart } = useApp();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { getDefaultAddress } = useAddress();

  const [note, setNote] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | undefined>(getDefaultAddress());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [codChangeNeeded, setCodChangeNeeded] = useState<number | undefined>();
  const [upiTxnRef, setUpiTxnRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const { data: shop } = useShop(cartShopId);
  const createOrder = useCreateOrder();

  const subtotal = getCartTotal();
  const pickupLat = shop?.pickupLat ?? 18.8305;
  const pickupLng = shop?.pickupLng ?? 78.6098;
  const dropLat = selectedAddress?.lat ?? 18.7892;
  const dropLng = selectedAddress?.lng ?? 78.5723;
  const distanceKm = calculateDistanceKm(pickupLat, pickupLng, dropLat, dropLng);
  const { fee: deliveryFee, freeDelivery } = calculateDeliveryFee(shop?.type || 'kirana', distanceKm, subtotal);
  const eta = calculateETA(distanceKm);
  const total = subtotal + deliveryFee;

  const en = language === 'en';

  const getProductName = (product: { name_te: string; name_en: string }) =>
    en ? product.name_en : product.name_te;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(SUPPORT_CONFIG.upiVpa);
    setCopied(true);
    toast.success(en ? 'Copied!' : 'కాపీ అయింది!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlaceOrder = async () => {
    if (!shop || cart.length === 0 || !user) {
      toast.error(en ? 'Unable to place order' : 'ఆర్డర్ చేయలేకపోయాము');
      return;
    }

    if (!selectedAddress) {
      toast.error(en ? 'Please add a delivery address' : 'డెలివరీ చిరునామా జోడించండి');
      return;
    }

    setIsPlacing(true);

    try {
      const isValidUUID = selectedAddress?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedAddress.id);

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
        addressId: isValidUUID ? selectedAddress.id : undefined,
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
      toast.error(en ? 'Failed to place order. Please try again.' : 'ఆర్డర్ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.');
    } finally {
      setIsPlacing(false);
    }
  };

  // Redirect if cart empty
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
          {en ? 'Go Home' : 'హోమ్‌కి వెళ్ళండి'}
        </button>
      </div>
    );
  }

  const addressLabel = selectedAddress ? (en ? selectedAddress.label_en : selectedAddress.label_te) : null;
  const addressLandmark = selectedAddress ? (en ? selectedAddress.landmark_en : selectedAddress.landmark_te) : null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${SUPPORT_CONFIG.upiVpa}&pn=${encodeURIComponent(SUPPORT_CONFIG.upiPayeeName)}&am=${total}&cu=INR`)}`;

  return (
    <div className="screen-shell min-h-screen flex flex-col bg-background">
      {/* ── 1. STICKY HEADER ── */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-foreground/5">
        <div className="pt-12 px-5 pb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/basket')}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="flex-1 text-center font-display text-2xl font-semibold text-foreground">
              {en ? 'Checkout' : 'చెక్‌అవుట్'}
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-40 space-y-5 pt-5">

        {/* ── 2. DELIVERY ADDRESS ── */}
        <div className="bg-card rounded-xl shadow-sm p-5">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            {en ? 'Delivery To' : 'డెలివరీ చిరునామా'}
          </p>

          {selectedAddress ? (
            <div>
              {selectedAddress.receiverName && (
                <p className="font-semibold text-foreground">{selectedAddress.receiverName}</p>
              )}
              {selectedAddress.phone && (
                <p className="text-sm text-muted-foreground mt-0.5">{selectedAddress.phone}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {addressLabel}, {addressLandmark}
                {(en ? selectedAddress.village_en : selectedAddress.village_te) &&
                  `, ${en ? selectedAddress.village_en : selectedAddress.village_te}`
                }
              </p>
              <button
                onClick={() => setShowAddressPicker(true)}
                className="text-primary text-sm font-medium mt-3 active:scale-95 transition-transform"
              >
                {en ? 'Change' : 'మార్చు'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddressPicker(true)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-primary/30 text-primary"
            >
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{en ? 'Add Delivery Address' : 'డెలివరీ చిరునామా జోడించండి'}</span>
            </button>
          )}
        </div>

        {/* ── 3. ORDER SUMMARY ── */}
        <div className="bg-card rounded-xl shadow-sm p-5">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
            {en ? 'Order Summary' : 'ఆర్డర్ సారాంశం'}
          </p>

          {/* Item rows */}
          <div className="space-y-3">
            {cart.map(item => {
              const productName = getProductName(item.product);
              return (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.product.image ? (
                      <img src={item.product.image} alt={productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{productName}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} × ₹{item.product.price}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">₹{item.product.price * item.quantity}</span>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="border-t border-foreground/5 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Subtotal' : 'ఉప మొత్తం'}</span>
              <span className="text-foreground">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Village Delivery Fee' : 'గ్రామ డెలివరీ రుసుము'}</span>
              <span className="text-primary font-medium">{freeDelivery ? (en ? 'Free' : 'ఉచితం') : `₹${deliveryFee}`}</span>
            </div>
            <div className="border-t border-dashed border-foreground/10 my-1" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">{en ? 'Total' : 'మొత్తం'}</span>
              <span className="text-2xl font-bold text-foreground">₹{total}</span>
            </div>
          </div>
        </div>

        {/* ── 4. VILLAGE LANDMARK NOTE ── */}
        <div className="rounded-xl border-2 border-dashed border-foreground/10 p-4">
          <label className="text-sm font-medium text-foreground block mb-2">
            {en ? 'Village Landmark (Optional)' : 'గ్రామ ల్యాండ్‌మార్క్ (ఐచ్ఛికం)'}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={en ? 'e.g., Near the banyan tree beside the old temple.' : 'ఉదా., పాత గుడి పక్కన మర్రి చెట్టు దగ్గర.'}
            className="w-full px-3 py-2.5 rounded-lg bg-background resize-none h-20 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground italic mt-1.5">
            {en ? 'Helps our local riders find you faster.' : 'మా స్థానిక రైడర్లు మిమ్మల్ని వేగంగా కనుగొనడానికి సహాయపడుతుంది.'}
          </p>
        </div>

        {/* ── 5. PAYMENT METHOD ── */}
        <div className="bg-card rounded-xl shadow-sm p-5">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
            {en ? 'Payment Method' : 'చెల్లింపు విధానం'}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* COD */}
            <button
              onClick={() => setPaymentMethod('COD')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-95 ${
                paymentMethod === 'COD'
                  ? 'border-primary bg-primary/5'
                  : 'border-foreground/10 bg-card'
              }`}
            >
              <Banknote className={`w-6 h-6 ${paymentMethod === 'COD' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${paymentMethod === 'COD' ? 'text-foreground' : 'text-muted-foreground'}`}>
                {en ? 'Cash on Delivery' : 'నగదు చెల్లింపు'}
              </span>
              {paymentMethod === 'COD' && <Check className="w-4 h-4 text-primary" />}
            </button>

            {/* UPI */}
            <button
              onClick={() => setPaymentMethod('UPI')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-95 ${
                paymentMethod === 'UPI'
                  ? 'border-primary bg-primary/5'
                  : 'border-foreground/10 bg-card'
              }`}
            >
              <CreditCard className={`w-6 h-6 ${paymentMethod === 'UPI' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${paymentMethod === 'UPI' ? 'text-foreground' : 'text-muted-foreground'}`}>
                {en ? 'UPI Payment' : 'UPI చెల్లింపు'}
              </span>
              {paymentMethod === 'UPI' && <Check className="w-4 h-4 text-primary" />}
            </button>
          </div>

          {/* COD Change Options */}
          {paymentMethod === 'COD' && (
            <div className="mt-4 pt-4 border-t border-foreground/5">
              <p className="text-sm text-muted-foreground mb-2">{en ? 'Need change for?' : 'చిల్లర కావాలి?'}</p>
              <div className="flex flex-wrap gap-2">
                {[0, 200, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setCodChangeNeeded(amount === 0 ? undefined : amount)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                      (amount === 0 && !codChangeNeeded) || codChangeNeeded === amount
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {amount === 0 ? (en ? 'None' : 'వద్దు') : `₹${amount}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* UPI Details */}
          {paymentMethod === 'UPI' && (
            <div className="mt-4 pt-4 border-t border-foreground/5 space-y-3">
              {/* Copy UPI ID */}
              <button
                onClick={handleCopyUpi}
                className="w-full py-2.5 rounded-xl border border-foreground/10 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm text-foreground">{SUPPORT_CONFIG.upiVpa}</span>
              </button>

              {/* QR Toggle */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full py-2 text-sm text-primary flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                {showQR ? (en ? 'Hide QR' : 'QR దాచు') : (en ? 'Show QR Code' : 'QR కోడ్ చూపించు')}
              </button>

              {showQR && (
                <div className="flex justify-center p-4 bg-background rounded-xl">
                  <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48" />
                </div>
              )}

              {/* UTR Input */}
              <input
                type="text"
                value={upiTxnRef}
                onChange={(e) => setUpiTxnRef(e.target.value)}
                placeholder={en ? 'Enter UTR / Reference Number' : 'UTR / రిఫరెన్స్ నంబర్'}
                className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background focus:outline-none focus:border-primary text-sm"
              />

              {/* Upload Proof */}
              <button className="w-full py-2.5 rounded-xl border border-dashed border-foreground/10 flex items-center justify-center gap-2 text-muted-foreground active:scale-95 transition-transform">
                <Upload className="w-4 h-4" />
                <span className="text-sm">{en ? 'Upload Payment Screenshot' : 'పేమెంట్ స్క్రీన్‌షాట్ అప్‌లోడ్'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 6. STICKY BOTTOM CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-md border-t border-foreground/5 px-5 py-4 pb-8 z-40">
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className="w-full bg-primary text-primary-foreground font-semibold text-base py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          {isPlacing
            ? (en ? 'Placing Order...' : 'ఆర్డర్ చేస్తోంది...')
            : (en ? 'Place Order' : 'ఆర్డర్ చేయండి')
          }
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
