import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, User, MapPin, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Town { id: string; name: string; }
interface Village { id: string; name: string; }

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { language } = useLanguage();
  const en = language === 'en';

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [townId, setTownId] = useState('');
  const [villageId, setVillageId] = useState('');

  const [towns, setTowns] = useState<Town[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [townsLoading, setTownsLoading] = useState(true);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize from profile
  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setDisplayName(p.display_name || '');
      setPhone(p.phone || '');
      setAddress(p.address || '');
      if (p.town_id) setTownId(p.town_id);
      if (p.village_id) setVillageId(p.village_id);
    }
  }, [profile]);

  // Fetch towns
  useEffect(() => {
    const fetchTowns = async () => {
      setTownsLoading(true);
      const { data, error } = await supabase
        .from('towns')
        .select('id,name')
        .order('name', { ascending: true });
      if (!error) setTowns(data ?? []);
      setTownsLoading(false);
    };
    fetchTowns();
  }, []);

  // Fetch villages when town changes
  useEffect(() => {
    if (!townId) { setVillages([]); return; }
    const fetchVillages = async () => {
      setVillagesLoading(true);
      const { data, error } = await supabase
        .from('villages')
        .select('id,name')
        .eq('town_id', townId)
        .order('name', { ascending: true });
      if (!error) setVillages(data ?? []);
      setVillagesLoading(false);
    };
    fetchVillages();
  }, [townId]);

  const handleTownChange = (value: string) => {
    setTownId(value);
    setVillageId('');
    setErrors(prev => ({ ...prev, townId: '', villageId: '' }));
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = en ? 'Full name is required' : 'పూర్తి పేరు అవసరం';
    if (!phone.trim()) newErrors.phone = en ? 'Phone number is required' : 'ఫోన్ నంబర్ అవసరం';
    if (!townId) newErrors.townId = en ? 'Please select your town' : 'దయచేసి మీ టౌన్ ఎంచుకోండి';
    if (!villageId) newErrors.villageId = en ? 'Please select your village' : 'దయచేసి మీ గ్రామాన్ని ఎంచుకోండి';
    if (!address.trim()) newErrors.address = en ? 'Address is required' : 'చిరునామా అవసరం';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        town_id: townId,
        village_id: villageId,
      })
      .eq('user_id', user?.id);

    if (error) {
      console.error('[EditProfile] save error:', error);
      toast.error(en ? 'Failed to update profile' : 'ప్రొఫైల్ అప్‌డేట్ విఫలం');
    } else {
      toast.success(en ? 'Profile updated successfully' : 'ప్రొఫైల్ విజయవంతంగా అప్‌డేట్ అయింది');
      navigate('/profile');
    }
    setSaving(false);
  };

  const email = user?.email || '';

  return (
    <MobileLayout showNav={false}>
      {/* Header */}
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

      <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-5 pt-5">
        {/* Section 1: Personal Details */}
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
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Full Name' : 'పూర్తి పేరు'} <span className="text-destructive">*</span>
              </label>
              <Input
                value={displayName}
                onChange={e => { setDisplayName(e.target.value); setErrors(p => ({ ...p, displayName: '' })); }}
                placeholder={en ? 'Enter your full name' : 'మీ పూర్తి పేరు నమోదు చేయండి'}
              />
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Phone Number' : 'ఫోన్ నంబర్'} <span className="text-destructive">*</span>
              </label>
              <Input
                value={phone}
                onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })); }}
                placeholder={en ? 'Enter phone number' : 'ఫోన్ నంబర్ నమోదు చేయండి'}
                type="tel"
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Email' : 'ఇమెయిల్'}
              </label>
              <Input value={email} disabled className="bg-muted/50 opacity-70" />
            </div>
          </div>
        </div>

        {/* Section 2: Location */}
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
            {/* Town */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Town' : 'టౌన్'} <span className="text-destructive">*</span>
              </label>
              {townsLoading ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {en ? 'Loading towns...' : 'టౌన్లు లోడ్ అవుతున్నాయి...'}
                </div>
              ) : (
                <Select value={townId} onValueChange={handleTownChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={en ? 'Select Town' : 'టౌన్ ఎంచుకోండి'} />
                  </SelectTrigger>
                  <SelectContent>
                    {towns.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.townId && <p className="text-xs text-destructive">{errors.townId}</p>}
            </div>

            {/* Village */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {en ? 'Village' : 'గ్రామం'} <span className="text-destructive">*</span>
              </label>
              {villagesLoading ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {en ? 'Loading villages...' : 'గ్రామాలు లోడ్ అవుతున్నాయి...'}
                </div>
              ) : (
                <Select value={villageId} onValueChange={v => { setVillageId(v); setErrors(p => ({ ...p, villageId: '' })); }} disabled={!townId}>
                  <SelectTrigger>
                    <SelectValue placeholder={en ? 'Select Village' : 'గ్రామం ఎంచుకోండి'} />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.villageId && <p className="text-xs text-destructive">{errors.villageId}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Address */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">
              {en ? 'Address' : 'చిరునామా'}
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {en ? 'Address Line' : 'చిరునామా'} <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={address}
              onChange={e => { setAddress(e.target.value); setErrors(p => ({ ...p, address: '' })); }}
              placeholder={en ? 'Enter your full address' : 'మీ పూర్తి చిరునామా నమోదు చేయండి'}
              rows={3}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground font-semibold text-base py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {en ? 'Save Changes' : 'మార్పులు సేవ్ చేయండి'}
        </button>
      </div>
    </MobileLayout>
  );
}
