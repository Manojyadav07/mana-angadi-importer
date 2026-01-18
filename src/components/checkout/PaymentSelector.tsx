import { ShopType, PaymentMethod, PaymentStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { CreditCard, Banknote, QrCode, Copy, Upload, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SUPPORT_CONFIG } from '@/types';

interface PaymentSelectorProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  codChangeNeeded?: number;
  onCodChangeChange: (amount: number | undefined) => void;
  upiTxnRef?: string;
  onUpiTxnRefChange: (ref: string) => void;
  shopType: ShopType;
}

export function PaymentSelector({
  subtotal,
  deliveryFee,
  total,
  paymentMethod,
  onPaymentMethodChange,
  codChangeNeeded,
  onCodChangeChange,
  upiTxnRef,
  onUpiTxnRefChange,
  shopType,
}: PaymentSelectorProps) {
  const { language } = useLanguage();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const labels = {
    paymentMethod: language === 'en' ? 'Payment Method' : 'చెల్లింపు విధానం',
    cod: language === 'en' ? 'Cash on Delivery' : 'డెలివరీ సమయంలో నగదు',
    upi: language === 'en' ? 'UPI Payment' : 'UPI చెల్లింపు',
    needChange: language === 'en' ? 'Need change?' : 'చిల్లర కావాలి?',
    none: language === 'en' ? 'None' : 'వద్దు',
    payWithUpi: language === 'en' ? 'Pay with any UPI app' : 'ఏదైనా UPI యాప్‌తో చెల్లించండి',
    showQr: language === 'en' ? 'Show QR Code' : 'QR కోడ్ చూపించు',
    hideQr: language === 'en' ? 'Hide QR' : 'QR దాచు',
    copyUpiId: language === 'en' ? 'Copy UPI ID' : 'UPI ID కాపీ చేయండి',
    copied: language === 'en' ? 'Copied!' : 'కాపీ అయింది!',
    enterUtr: language === 'en' ? 'Enter UTR/Reference Number' : 'UTR/రిఫరెన్స్ నంబర్ నమోదు చేయండి',
    utrPlaceholder: language === 'en' ? 'Transaction reference' : 'ట్రాన్సాక్షన్ రిఫరెన్స్',
    uploadProof: language === 'en' ? 'Upload payment screenshot (optional)' : 'పేమెంట్ స్క్రీన్‌షాట్ అప్‌లోడ్ చేయండి (ఐచ్ఛికం)',
    priceBreakdown: language === 'en' ? 'Price Breakdown' : 'ధర వివరాలు',
    itemsSubtotal: language === 'en' ? 'Items subtotal' : 'వస్తువుల మొత్తం',
    deliveryFee: language === 'en' ? 'Delivery fee' : 'డెలివరీ ఫీ',
    total: language === 'en' ? 'Total' : 'మొత్తం',
    freeDelivery: language === 'en' ? 'Free Delivery!' : 'ఉచిత డెలివరీ!',
  };

  const changeOptions = [0, 200, 500, 1000];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(SUPPORT_CONFIG.upiVpa);
    setCopied(true);
    toast.success(labels.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateUpiLink = () => {
    const upiUrl = `upi://pay?pa=${SUPPORT_CONFIG.upiVpa}&pn=${encodeURIComponent(SUPPORT_CONFIG.upiPayeeName)}&am=${total}&cu=INR`;
    window.location.href = upiUrl;
  };

  // Generate QR code URL using a free QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${SUPPORT_CONFIG.upiVpa}&pn=${encodeURIComponent(SUPPORT_CONFIG.upiPayeeName)}&am=${total}&cu=INR`)}`;

  return (
    <div className="space-y-4">
      {/* Price Breakdown Card */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <h3 className="font-semibold text-foreground mb-3">{labels.priceBreakdown}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{labels.itemsSubtotal}</span>
            <span className="text-foreground">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{labels.deliveryFee}</span>
            {deliveryFee === 0 ? (
              <span className="text-primary font-medium">{labels.freeDelivery}</span>
            ) : (
              <span className="text-foreground">₹{deliveryFee}</span>
            )}
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between font-semibold">
            <span className="text-foreground">{labels.total}</span>
            <span className="text-primary text-lg">₹{total}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <h3 className="font-semibold text-foreground mb-3">{labels.paymentMethod}</h3>
        <div className="space-y-3">
          {/* COD Option */}
          <button
            onClick={() => onPaymentMethodChange('COD')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              paymentMethod === 'COD'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              paymentMethod === 'COD' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <Banknote className="w-5 h-5" />
            </div>
            <span className="font-medium text-foreground">{labels.cod}</span>
            {paymentMethod === 'COD' && (
              <Check className="w-5 h-5 text-primary ml-auto" />
            )}
          </button>

          {/* UPI Option */}
          <button
            onClick={() => onPaymentMethodChange('UPI')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              paymentMethod === 'UPI'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              paymentMethod === 'UPI' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-medium text-foreground">{labels.upi}</span>
            {paymentMethod === 'UPI' && (
              <Check className="w-5 h-5 text-primary ml-auto" />
            )}
          </button>
        </div>
      </div>

      {/* COD Change Options */}
      {paymentMethod === 'COD' && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <h4 className="font-medium text-foreground mb-3">{labels.needChange}</h4>
          <div className="flex flex-wrap gap-2">
            {changeOptions.map((amount) => (
              <button
                key={amount}
                onClick={() => onCodChangeChange(amount === 0 ? undefined : amount)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (amount === 0 && !codChangeNeeded) || codChangeNeeded === amount
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {amount === 0 ? labels.none : `₹${amount}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* UPI Payment Section */}
      {paymentMethod === 'UPI' && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          {/* Pay Button */}
          <button
            onClick={generateUpiLink}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            {labels.payWithUpi}
          </button>

          {/* QR Toggle */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full py-2 text-sm text-primary flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            {showQR ? labels.hideQr : labels.showQr}
          </button>

          {/* QR Code */}
          {showQR && (
            <div className="flex justify-center p-4 bg-white rounded-xl">
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48" />
            </div>
          )}

          {/* Copy UPI ID */}
          <button
            onClick={handleCopyUpi}
            className="w-full py-2 rounded-xl border border-border flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{labels.copyUpiId}: {SUPPORT_CONFIG.upiVpa}</span>
          </button>

          {/* UTR Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{labels.enterUtr}</label>
            <input
              type="text"
              value={upiTxnRef || ''}
              onChange={(e) => onUpiTxnRefChange(e.target.value)}
              placeholder={labels.utrPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary"
            />
          </div>

          {/* Upload Proof (placeholder) */}
          <button className="w-full py-2 rounded-xl border border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm">{labels.uploadProof}</span>
          </button>
        </div>
      )}
    </div>
  );
}
