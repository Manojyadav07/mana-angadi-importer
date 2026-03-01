import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft, Store, Loader2, Upload, Camera, X, AlertTriangle, Info,
} from 'lucide-react';

const BUSINESS_TYPES = [
  { value: 'grocery', en: 'Grocery Store', te: 'కిరాణా దుకాణం' },
  { value: 'bakery', en: 'Bakery', te: 'బేకరీ' },
  { value: 'restaurant', en: 'Restaurant', te: 'రెస్టారెంట్' },
  { value: 'fruits_vegetables', en: 'Fruits & Vegetables', te: 'పండ్లు & కూరగాయలు' },
  { value: 'dairy', en: 'Dairy', te: 'డెయిరీ' },
  { value: 'medical', en: 'Medical Store', te: 'మందుల దుకాణం' },
  { value: 'general', en: 'General Store', te: 'జనరల్ స్టోర్' },
  { value: 'other', en: 'Other', te: 'ఇతర' },
];

interface Village {
  id: string;
  name: string;
}

export function MerchantApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const en = language === 'en';

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [villageId, setVillageId] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [sellsFood, setSellsFood] = useState<string>('');
  const [fssaiAvailable, setFssaiAvailable] = useState<string>('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [declaration, setDeclaration] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // File uploads
  const [idProofUrl, setIdProofUrl] = useState('');
  const [shopPhotoUrl, setShopPhotoUrl] = useState('');
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingShop, setUploadingShop] = useState(false);
  const idInputRef = useRef<HTMLInputElement>(null);
  const shopInputRef = useRef<HTMLInputElement>(null);

  // Villages
  const [villages, setVillages] = useState<Village[]>([]);
  const [villagesLoading, setVillagesLoading] = useState(true);
  const [villagesError, setVillagesError] = useState(false);
  const [fetchError, setFetchError] = useState<string>('');
  useEffect(() => {
    const fetchVillages = async () => {
      setVillagesLoading(true);
      setVillagesError(false);
      setFetchError('');
      try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        console.log('[VillageFetch] supabaseUrl:', url);
        console.log('[VillageFetch] supabaseKey:', key?.slice(0, 10) + '…');
        await supabase.auth.getSession();
        const { data, error } = await supabase
          .from('villages')
          .select('id,name')
          .order('name', { ascending: true });
        console.log('[VillageFetch] error:', error);
        console.log('[VillageFetch] data:', data);
        if (error) {
          console.error('Failed to fetch villages:', error);
          setFetchError(error.message);
          setVillagesError(true);
        } else {
          setVillages(data ?? []);
        }
      } catch (err: any) {
        console.error('Village fetch exception:', err);
        setFetchError(err?.message || 'Unknown error');
        setVillagesError(true);
      } finally {
        setVillagesLoading(false);
      }
    };
    fetchVillages();
  }, []);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${folder}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('merchant-documents').upload(path, file, { upsert: true });
    if (error) { toast.error(en ? 'Upload failed' : 'అప్‌లోడ్ విఫలమైంది'); return null; }
    const { data: urlData } = supabase.storage.from('merchant-documents').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(true);
    const url = await uploadFile(file, 'id_proof');
    if (url) setIdProofUrl(url);
    setUploadingId(false);
  };

  const handleShopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingShop(true);
    const url = await uploadFile(file, 'shop_photo');
    if (url) setShopPhotoUrl(url);
    setUploadingShop(false);
  };

  const isBasicValid = fullName && phone && shopName && address && villageId;
  const isBusinessValid = businessType && sellsFood;
  const isFoodCompliant = sellsFood === 'no' || (sellsFood === 'yes' && (fssaiAvailable === 'no' || (fssaiAvailable === 'yes' && fssaiNumber)));
  const canSubmit = isBasicValid && isBusinessValid && isFoodCompliant && idProofUrl && declaration && !submitting;

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;
    setSubmitting(true);

    const formData = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      shop_name: shopName.trim(),
      address: address.trim(),
      village_id: villageId,
      business_type: businessType,
      sells_food: sellsFood === 'yes',
      fssai_available: fssaiAvailable === 'yes',
      fssai_number: fssaiNumber.trim() || null,
      upi_id: upiId.trim() || null,
      bank_details: (accountHolder || accountNumber || ifsc) ? {
        account_holder: accountHolder.trim(),
        account_number: accountNumber.trim(),
        ifsc: ifsc.trim(),
      } : null,
      documents: {
        id_proof_url: idProofUrl,
        shop_photo_url: shopPhotoUrl || null,
      },
    };

    const { error } = await (supabase as any)
      .from('onboarding_applications')
      .upsert(
        { user_id: user.id, role: 'merchant', status: 'pending', form_data: formData },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      toast.error(en ? 'Submission failed. Try again.' : 'సమర్పణ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.');
    } else {
      toast.success(en ? 'Application submitted!' : 'దరఖాస్తు సమర్పించబడింది!');
      navigate('/merchant/application-status', { replace: true });
    }
    setSubmitting(false);
  };

  return (
    <MobileLayout showNav={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-serif text-lg font-semibold text-foreground">{en ? 'Merchant Application' : 'వ్యాపారి దరఖాస్తు'}</h1>
        </header>

        {/* Hero */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">{en ? 'Become a Mana Angadi Merchant' : 'మన అంగడి వ్యాపారిగా మారండి'}</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {en
              ? 'Partner with Mana Angadi and bring your shop to the digital village marketplace.'
              : 'మన అంగడితో భాగస్వామ్యం చేయండి, మీ దుకాణాన్ని డిజిటల్ గ్రామ మార్కెట్‌ప్లేస్‌కి తీసుకురండి.'}
          </p>
        </div>

        <div className="px-4 pb-32 space-y-4">
          {/* Section 1 – Basic Information */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <h3 className="font-serif font-semibold text-foreground">{en ? 'Basic Information' : 'ప్రాథమిక సమాచారం'}</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Full Name' : 'పూర్తి పేరు'} *</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder={en ? 'Enter your full name' : 'మీ పూర్తి పేరు'} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Phone Number' : 'ఫోన్ నంబర్'} *</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" type="tel" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Proposed Shop Name' : 'ప్రతిపాదిత దుకాణం పేరు'} *</Label>
                <Input value={shopName} onChange={e => setShopName(e.target.value)} placeholder={en ? 'Your shop name' : 'మీ దుకాణం పేరు'} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Shop Address' : 'దుకాణం చిరునామా'} *</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder={en ? 'Full address' : 'పూర్తి చిరునామా'} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Village' : 'గ్రామం'} *</Label>
                {villagesLoading ? (
                  <div className="mt-1 flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{en ? 'Loading villages…' : 'గ్రామాలు లోడ్ అవుతున్నాయి…'}</span>
                  </div>
                ) : villagesError ? (
                  <div className="mt-1 flex items-center gap-2 min-h-[2.5rem] px-3 rounded-md border border-destructive bg-destructive/5 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{fetchError || (en ? 'Failed to load villages' : 'గ్రామాలు లోడ్ చేయడం విఫలమైంది')}</span>
                  </div>
                ) : (
                  <Select value={villageId} onValueChange={setVillageId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={en ? 'Select Village' : 'గ్రామం ఎంచుకోండి'} /></SelectTrigger>
                    <SelectContent>
                      {villages.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {/* Section 2 – Business Details */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <h3 className="font-serif font-semibold text-foreground">{en ? 'Business Details' : 'వ్యాపార వివరాలు'}</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Business Type' : 'వ్యాపార రకం'} *</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={en ? 'Select type' : 'రకం ఎంచుకోండి'} /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map(bt => (
                      <SelectItem key={bt.value} value={bt.value}>{en ? bt.en : bt.te}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Do you sell food items?' : 'మీరు ఆహార పదార్థాలు అమ్ముతారా?'} *</Label>
                <RadioGroup value={sellsFood} onValueChange={setSellsFood} className="mt-2 flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="food-yes" />
                    <Label htmlFor="food-yes" className="text-sm">{en ? 'Yes' : 'అవును'}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="food-no" />
                    <Label htmlFor="food-no" className="text-sm">{en ? 'No' : 'కాదు'}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Section 3 – Food Compliance (Conditional) */}
          {sellsFood === 'yes' && (
            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              <h3 className="font-serif font-semibold text-foreground">{en ? 'Food Compliance' : 'ఆహార అనుపాలనం'}</h3>
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Do you have FSSAI Registration?' : 'మీకు FSSAI రిజిస్ట్రేషన్ ఉందా?'}</Label>
                <RadioGroup value={fssaiAvailable} onValueChange={setFssaiAvailable} className="mt-2 flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="fssai-yes" />
                    <Label htmlFor="fssai-yes" className="text-sm">{en ? 'Yes' : 'అవును'}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="fssai-no" />
                    <Label htmlFor="fssai-no" className="text-sm">{en ? 'No' : 'కాదు'}</Label>
                  </div>
                </RadioGroup>
              </div>
              {fssaiAvailable === 'yes' && (
                <div>
                  <Label className="text-sm text-muted-foreground">FSSAI {en ? 'Registration Number' : 'రిజిస్ట్రేషన్ నంబర్'} *</Label>
                  <Input value={fssaiNumber} onChange={e => setFssaiNumber(e.target.value)} placeholder="e.g. 10012345678901" className="mt-1" />
                </div>
              )}
              {fssaiAvailable === 'no' && (
                <div className="bg-accent/50 border border-accent rounded-xl p-3 flex gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-foreground/70 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {en
                      ? 'FSSAI registration is mandatory to sell food items. You must obtain it before activation.'
                      : 'ఆహార పదార్థాలు అమ్మడానికి FSSAI రిజిస్ట్రేషన్ తప్పనిసరి. క్రియాశీలం చేయడానికి ముందు మీరు దానిని పొందాలి.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Section 4 – Settlement Information */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <h3 className="font-serif font-semibold text-foreground">{en ? 'Settlement Information' : 'సెటిల్‌మెంట్ సమాచారం'}</h3>
            <p className="text-xs text-muted-foreground">{en ? 'Optional — you can add this later' : 'ఐచ్ఛికం — మీరు దీనిని తర్వాత జోడించవచ్చు'}</p>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">UPI ID</Label>
                <Input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" className="mt-1" />
              </div>
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{en ? 'OR' : 'లేదా'}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Account Holder Name' : 'ఖాతా హోల్డర్ పేరు'}</Label>
                <Input value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{en ? 'Account Number' : 'ఖాతా నంబర్'}</Label>
                <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">IFSC {en ? 'Code' : 'కోడ్'}</Label>
                <Input value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="e.g. SBIN0001234" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Section 5 – Document Upload */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <h3 className="font-serif font-semibold text-foreground">{en ? 'Document Upload' : 'డాక్యుమెంట్ అప్‌లోడ్'}</h3>
            
            {/* ID Proof */}
            <div>
              <Label className="text-sm text-muted-foreground">{en ? 'Government ID Proof' : 'ప్రభుత్వ ID ప్రూఫ్'} *</Label>
              <input type="file" accept="image/*" ref={idInputRef} onChange={handleIdUpload} className="hidden" />
              {idProofUrl ? (
                <div className="mt-2 relative rounded-xl overflow-hidden border border-border">
                  <img src={idProofUrl} alt="ID Proof" className="w-full h-32 object-cover" />
                  <button onClick={() => { setIdProofUrl(''); }} className="absolute top-2 right-2 bg-card/80 backdrop-blur rounded-full p-1">
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => idInputRef.current?.click()}
                  disabled={uploadingId}
                  className="mt-2 w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground active:bg-muted/40 transition-colors"
                >
                  {uploadingId ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  <span className="text-xs">{en ? 'Tap to upload' : 'అప్‌లోడ్ చేయండి'}</span>
                </button>
              )}
            </div>

            {/* Shop Photo */}
            <div>
              <Label className="text-sm text-muted-foreground">{en ? 'Shop Photo' : 'దుకాణం ఫోటో'} ({en ? 'optional' : 'ఐచ్ఛికం'})</Label>
              <input type="file" accept="image/*" ref={shopInputRef} onChange={handleShopUpload} className="hidden" />
              {shopPhotoUrl ? (
                <div className="mt-2 relative rounded-xl overflow-hidden border border-border">
                  <img src={shopPhotoUrl} alt="Shop" className="w-full h-32 object-cover" />
                  <button onClick={() => { setShopPhotoUrl(''); }} className="absolute top-2 right-2 bg-card/80 backdrop-blur rounded-full p-1">
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => shopInputRef.current?.click()}
                  disabled={uploadingShop}
                  className="mt-2 w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground active:bg-muted/40 transition-colors"
                >
                  {uploadingShop ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  <span className="text-xs">{en ? 'Tap to upload' : 'అప్‌లోడ్ చేయండి'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="declaration"
                checked={declaration}
                onCheckedChange={(v) => setDeclaration(v === true)}
                className="mt-0.5"
              />
              <label htmlFor="declaration" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                {en
                  ? 'I confirm that all information provided is correct and I am responsible for obtaining necessary licenses including FSSAI registration.'
                  : 'నేను అందించిన సమాచారం అంతా సరైనదని మరియు FSSAI రిజిస్ట్రేషన్‌తో సహా అవసరమైన లైసెన్సులను పొందడానికి నేను బాధ్యుడిని అని నిర్ధారిస్తున్నాను.'}
              </label>
            </div>
          </div>
        </div>

        {/* Sticky Submit */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4 safe-bottom z-30">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {en ? 'Submit Application' : 'దరఖాస్తు సమర్పించండి'}
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
