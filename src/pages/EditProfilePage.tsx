import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, User, MapPin, Home, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Town { id: string; name: string; }
interface Village { id: string; name: string; }

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const en = language === 'en';

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [townId, setTownId] = useState('');
  const [villageId, setVillageId] = useState('');

  const [towns, setTowns] = useState<Town[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [townsLoading, setTownsLoading] = useState(true);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setDisplayName(p.display_name || '');
      setPhone(p.phone || '');
      setDeliveryPhone(p.delivery_phone || '');
      // Parse existing delivery_address back into fields
      if (p.delivery_address) {
        const parts = p.delivery_address.split('|');
        setDoorNumber(parts[0]?.trim() || '');
        setLandmark(parts[1]?.trim() || '');
      }
      if (p.town_id) setTownId(p.town_id);
      if (p.village_id) setVillageId(p.village_id);
    }
  }, [profile]);

  useEffect(() => {
    supabase.from('towns').select('id,name').order('name').then(({ data }) => {
      setTowns(data ?? []);
      setTownsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!townId) { setVillages([]); return; }
    setVillagesLoading(true);
    supabase.from('villages').select('id,name').eq('town_id', townId).order('name').then(({ data }) => {
      setVillages(data ?? []);
      setVillagesLoading(false);
    });
  }, [townId]);

  const handleTownChange = (value: string) => {
    setTownId(value);
    setVillageId('');
    setErrors(p => ({ ...p, townId: '', villageId: '' }));
  };

  const selectedVillageName = villages.find(v => v.id === villageId)?.name || '';

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = en ? 'Full name is required' : 'పూర్తి పేరు అవసరం';
    if (!phone.trim()) newErrors.phone = en ? 'Phone number is required' : 'ఫోన్ నంబర్ అవసరం';
    if (!townId) newErrors.townId = en ? 'Please select your town' : 'దయచేసి మీ టౌన్ ఎంచుకోండి';
    if (!villageId) newErrors.villageId = en ? 'Please select your village' : 'దయచేసి మీ గ్రామాన్ని ఎంచుకోండి';
    if (!doorNumber.trim()) newErrors.doorNumber = en ? 'Door/House number is required' : 'తలుపు నంబర్ అవసరం';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Combine address fields with pipe separator for easy parsing
    const deliveryAddress = `${doorNumber.trim()} | ${landmark.trim()}`;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        phone: phone.trim(),
        delivery_phone: deliveryPhone.trim() || phone.trim(),
        delivery_address: deliveryAddress,
        town_id: townId,
        village_id: villageId,
      })
      .eq('user_id', user?.id);

    if (error) {
      toast.error(en ? 'Failed to update profile' : 'ప్రొఫైల్ అప్‌డేట్ విఫలం');
    } else {
      toast.success(en ? 'Profile updated successfully' : 'ప్రొఫైల్ విజయవంతంగా అప్‌డేట్ అయింది');
      navigate('/profile');
    }
    setSaving(false);
  };

  return (
    <MobileLayout showNav={false}>
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-foreground/5">
        <div className="pt-12 px-5 pb-4">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="flex-1 text-center font-display text-2xl font-semibold text-foreground">
              {en ? 'Edit Profile' : 'ప్రొఫైల్ మార్చండి'}
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <div className="px-5 pb-10 space-y-5 pt-5">

        {/* Personal Details */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">
              {en ? 'Personal Details' : 'వ్యక్తిగత వివరాలు'}
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Full Name' : 'పూర్తి పేరు'} <span className="text-destructive">*</span>
              </label>
              <Input value={displayName} onChange={e => { setDisplayName(e.target.value); setErrors(p => ({ ...p, displayName: '' })); }}
                placeholder={en ? 'Enter your full name' : 'మీ పూర్తి పేరు నమోదు చేయండి'} />
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Phone Number' : 'ఫోన్ నంబర్'} <span className="text-destructive">*</span>
              </label>
              <Input value={phone} onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })); }}
                placeholder="10-digit mobile number" type="tel" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Email' : 'ఇమెయిల్'}
              </label>
              <Input value={user?.email || ''} disabled className="bg-muted/50 opacity-70" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">
              {en ? 'Location' : 'లొకేషన్'}
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Town' : 'టౌన్'} <span className="text-destructive">*</span>
              </label>
              {townsLoading ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {en ? 'Loading...' : 'లోడ్ అవుతోంది...'}
                </div>
              ) : (
                <Select value={townId} onValueChange={handleTownChange}>
                  <SelectTrigger><SelectValue placeholder={en ? 'Select Town' : 'టౌన్ ఎంచుకోండి'} /></SelectTrigger>
                  <SelectContent>{towns.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
              {errors.townId && <p className="text-xs text-destructive">{errors.townId}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Village' : 'గ్రామం'} <span className="text-destructive">*</span>
              </label>
              {villagesLoading ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                <Select value={villageId} onValueChange={v => { setVillageId(v); setErrors(p => ({ ...p, villageId: '' })); }} disabled={!townId}>
                  <SelectTrigger><SelectValue placeholder={en ? 'Select Village' : 'గ్రామం ఎంచుకోండి'} /></SelectTrigger>
                  <SelectContent>{villages.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
              {errors.villageId && <p className="text-xs text-destructive">{errors.villageId}</p>}
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">
              {en ? 'Delivery Address' : 'డెలివరీ చిరునామా'}
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Door / House Number' : 'తలుపు / ఇంటి నంబర్'} <span className="text-destructive">*</span>
              </label>
              <Input value={doorNumber} onChange={e => { setDoorNumber(e.target.value); setErrors(p => ({ ...p, doorNumber: '' })); }}
                placeholder={en ? 'e.g. Door No. 4-5, Yadav Street' : 'ఉదా. తలుపు నం. 4-5, యాదవ్ వీధి'} />
              {errors.doorNumber && <p className="text-xs text-destructive">{errors.doorNumber}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Street / Landmark' : 'వీధి / లాండ్‌మార్క్'}
              </label>
              <Input value={landmark} onChange={e => setLandmark(e.target.value)}
                placeholder={en ? 'e.g. Near Hanuman Temple' : 'ఉదా. హనుమాన్ గుడి దగ్గర'} />
            </div>

            {/* Village display (read-only) */}
            {selectedVillageName && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {en ? 'Village' : 'గ్రామం'}
                </label>
                <Input value={selectedVillageName} disabled className="bg-muted/50 opacity-70" />
              </div>
            )}
          </div>
        </div>

        {/* Delivery Phone */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">
              {en ? 'Delivery Contact' : 'డెలివరీ సంప్రదింపు'}
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {en ? 'Phone for Delivery (if different)' : 'డెలివరీ ఫోన్ (వేరే అయితే)'}
            </label>
            <Input value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value)}
              placeholder={en ? 'Leave blank to use your main phone' : 'ఖాళీగా వదిలితే మీ ప్రధాన ఫోన్ వాడతాం'}
              type="tel" />
            <p className="text-xs text-muted-foreground">
              {en ? 'Rider will call this number at delivery' : 'డెలివరీ సమయంలో రైడర్ ఈ నంబర్‌కు కాల్ చేస్తాడు'}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-primary text-primary-foreground font-semibold text-base py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-70 flex items-center justify-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {en ? 'Save Changes' : 'మార్పులు సేవ్ చేయండి'}
        </button>
      </div>
    </MobileLayout>
  );
}