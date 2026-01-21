import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCreateShop } from '@/hooks/useShops';
import { supabase } from '@/integrations/supabase/client';
import { Store, Briefcase, Pill, UtensilsCrossed, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ShopType } from '@/types';

// Sample products to seed based on shop type
const SAMPLE_PRODUCTS: Record<ShopType, Array<{ name_te: string; name_en: string; price: number }>> = {
  kirana: [
    { name_te: 'బియ్యం (1కేజి)', name_en: 'Rice (1kg)', price: 60 },
    { name_te: 'పంచదార (1కేజి)', name_en: 'Sugar (1kg)', price: 45 },
    { name_te: 'నూనె (1లీ)', name_en: 'Oil (1L)', price: 150 },
    { name_te: 'పాలు (500మిలి)', name_en: 'Milk (500ml)', price: 30 },
    { name_te: 'ఉప్పు (1కేజి)', name_en: 'Salt (1kg)', price: 20 },
    { name_te: 'టీ పొడి (250గ్రా)', name_en: 'Tea Powder (250g)', price: 80 },
    { name_te: 'సబ్బు', name_en: 'Soap', price: 35 },
    { name_te: 'బిస్కెట్ (పెద్ద)', name_en: 'Biscuit (Large)', price: 25 },
    { name_te: 'గోధుమ పిండి (1కేజి)', name_en: 'Wheat Flour (1kg)', price: 45 },
    { name_te: 'పప్పు (500గ్రా)', name_en: 'Dal (500g)', price: 70 },
  ],
  restaurant: [
    { name_te: 'చికెన్ బిర్యానీ', name_en: 'Chicken Biryani', price: 180 },
    { name_te: 'వెజ్ మీల్స్', name_en: 'Veg Meals', price: 80 },
    { name_te: 'ఇడ్లీ (2)', name_en: 'Idli (2 pcs)', price: 30 },
    { name_te: 'దోసె', name_en: 'Dosa', price: 40 },
    { name_te: 'టీ', name_en: 'Tea', price: 15 },
    { name_te: 'కాఫీ', name_en: 'Coffee', price: 20 },
    { name_te: 'చికెన్ కర్రీ', name_en: 'Chicken Curry', price: 150 },
    { name_te: 'ఎగ్ రైస్', name_en: 'Egg Rice', price: 70 },
    { name_te: 'చపాతీ (2)', name_en: 'Chapati (2 pcs)', price: 25 },
    { name_te: 'వెజ్ బిర్యానీ', name_en: 'Veg Biryani', price: 120 },
  ],
  medical: [
    { name_te: 'పారాసిటమాల్', name_en: 'Paracetamol', price: 15 },
    { name_te: 'ఓఆర్‌ఎస్ పౌడర్', name_en: 'ORS Powder', price: 20 },
    { name_te: 'బ్యాండేజ్', name_en: 'Bandage', price: 30 },
    { name_te: 'యాంటీసెప్టిక్ క్రీం', name_en: 'Antiseptic Cream', price: 45 },
    { name_te: 'మాస్క్ (5)', name_en: 'Mask (5 pcs)', price: 25 },
    { name_te: 'సానిటైజర్', name_en: 'Sanitizer', price: 50 },
    { name_te: 'కఫ్ సిరప్', name_en: 'Cough Syrup', price: 65 },
    { name_te: 'పెయిన్ రిలీఫ్ జెల్', name_en: 'Pain Relief Gel', price: 80 },
    { name_te: 'విటమిన్ సి', name_en: 'Vitamin C', price: 40 },
    { name_te: 'కాటన్ రోల్', name_en: 'Cotton Roll', price: 35 },
  ],
};

export function MerchantShopSetupPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const createShop = useCreateShop();

  const [shopType, setShopType] = useState<ShopType | null>(null);
  const [nameTe, setNameTe] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labels = {
    title: language === 'en' ? 'Set Up Your Shop' : 'మీ దుకాణం సెటప్ చేయండి',
    subtitle: language === 'en' ? 'Tell us about your business' : 'మీ వ్యాపారం గురించి చెప్పండి',
    shopType: language === 'en' ? 'Shop Type' : 'దుకాణం రకం',
    kirana: language === 'en' ? 'Grocery' : 'కిరాణా',
    restaurant: language === 'en' ? 'Restaurant' : 'హోటల్',
    medical: language === 'en' ? 'Medical' : 'మెడికల్',
    shopNameTe: language === 'en' ? 'Shop Name (Telugu)' : 'దుకాణం పేరు (తెలుగు)',
    shopNameEn: language === 'en' ? 'Shop Name (English)' : 'దుకాణం పేరు (ఆంగ్లం)',
    teluguPlaceholder: 'తెలుగులో పేరు',
    englishPlaceholder: 'Name in English',
    createShop: language === 'en' ? 'Create Shop' : 'దుకాణం సృష్టించండి',
    creating: language === 'en' ? 'Creating...' : 'సృష్టిస్తోంది...',
    required: language === 'en' ? 'Required' : 'అవసరం',
    shopCreated: language === 'en' ? 'Shop created successfully!' : 'దుకాణం విజయవంతంగా సృష్టించబడింది!',
    error: language === 'en' ? 'Failed to create shop' : 'దుకాణం సృష్టించడంలో విఫలమైంది',
    fillAll: language === 'en' ? 'Please fill all required fields' : 'దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లను పూరించండి',
    sampleProductsAdded: language === 'en' ? 'Sample products added!' : 'నమూనా ఉత్పత్తులు జోడించబడ్డాయి!',
  };

  const shopTypes: { type: ShopType; icon: React.ReactNode; label: string }[] = [
    { type: 'kirana', icon: <Store className="w-6 h-6" />, label: labels.kirana },
    { type: 'restaurant', icon: <UtensilsCrossed className="w-6 h-6" />, label: labels.restaurant },
    { type: 'medical', icon: <Pill className="w-6 h-6" />, label: labels.medical },
  ];

  const handleSubmit = async () => {
    if (!shopType || !nameTe.trim() || !nameEn.trim()) {
      toast.error(labels.fillAll);
      return;
    }

    if (!user) {
      toast.error('Not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the shop
      const newShop = await createShop.mutateAsync({
        ownerId: user.id,
        name_te: nameTe.trim(),
        name_en: nameEn.trim(),
        type: shopType,
        isOpen: true,
        isActive: true,
        pickupLat: undefined,
        pickupLng: undefined,
        upiVpa: undefined,
        upiPayeeName: undefined,
        villageId: undefined,
      });

      // Seed sample products
      const sampleProducts = SAMPLE_PRODUCTS[shopType];
      const productInserts = sampleProducts.map((p) => ({
        shop_id: newShop.id,
        name_te: p.name_te,
        name_en: p.name_en,
        price: p.price,
        in_stock: true,
        is_active: true,
      }));

      const { error: productError } = await supabase
        .from('products')
        .insert(productInserts);

      if (productError) {
        console.error('Failed to seed products:', productError);
        // Don't fail the whole flow, just warn
        toast.warning(language === 'en' ? 'Shop created, but sample products failed' : 'దుకాణం సృష్టించబడింది, కానీ నమూనా ఉత్పత్తులు విఫలమయ్యాయి');
      } else {
        toast.success(labels.sampleProductsAdded);
      }

      toast.success(labels.shopCreated);
      navigate('/merchant/products');
    } catch (err: any) {
      console.error('Shop creation error:', err);
      toast.error(labels.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = shopType && nameTe.trim() && nameEn.trim();

  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col min-h-screen px-4 py-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{labels.title}</h1>
          <p className="text-muted-foreground mt-1">{labels.subtitle}</p>
        </div>

        {/* Shop Type Selection */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-medium text-foreground mb-3">
            {labels.shopType} <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {shopTypes.map(({ type, icon, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => setShopType(type)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  shopType === type
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    shopType === type ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {icon}
                </div>
                <span
                  className={`text-sm font-medium ${
                    shopType === type ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Shop Names */}
        <div className="space-y-4 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {labels.shopNameTe} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={nameTe}
              onChange={(e) => setNameTe(e.target.value)}
              placeholder={labels.teluguPlaceholder}
              className="input-village"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {labels.shopNameEn} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder={labels.englishPlaceholder}
              className="input-village"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {labels.creating}
              </>
            ) : (
              <>
                {labels.createShop}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
