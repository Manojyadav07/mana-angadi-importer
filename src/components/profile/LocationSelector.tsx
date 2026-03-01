import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Loader2, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Town { id: string; name: string; }
interface Village { id: string; name: string; }

export function LocationSelector() {
  const { language } = useLanguage();
  const { user, profile, updateProfile } = useAuth();

  const [towns, setTowns] = useState<Town[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [townId, setTownId] = useState<string>('');
  const [villageId, setVillageId] = useState<string>('');
  const [townsLoading, setTownsLoading] = useState(true);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [townError, setTownError] = useState('');
  const [villageError, setVillageError] = useState('');

  // Initialize from profile
  useEffect(() => {
    if (profile) {
      const p = profile as any;
      if (p.town_id) setTownId(p.town_id);
      if (p.village_id) setVillageId(p.village_id);
    }
  }, [profile]);

  // Fetch towns
  useEffect(() => {
    const fetchTowns = async () => {
      setTownsLoading(true);
      await supabase.auth.getSession();
      const { data, error } = await supabase
        .from('towns')
        .select('id,name')
        .order('name', { ascending: true });
      if (error) {
        console.error('[LocationSelector] towns error:', error);
      } else {
        setTowns(data ?? []);
      }
      setTownsLoading(false);
    };
    fetchTowns();
  }, []);

  // Fetch villages when town changes
  useEffect(() => {
    if (!townId) {
      setVillages([]);
      return;
    }
    const fetchVillages = async () => {
      setVillagesLoading(true);
      const { data, error } = await supabase
        .from('villages')
        .select('id,name')
        .eq('town_id', townId)
        .order('name', { ascending: true });
      if (error) {
        console.error('[LocationSelector] villages error:', error);
      } else {
        setVillages(data ?? []);
      }
      setVillagesLoading(false);
    };
    fetchVillages();
  }, [townId]);

  const handleTownChange = (value: string) => {
    setTownId(value);
    setVillageId('');
    setTownError('');
    setVillageError('');
  };

  const handleVillageChange = (value: string) => {
    setVillageId(value);
    setVillageError('');
  };

  const handleSave = async () => {
    let hasError = false;
    if (!townId) {
      setTownError(language === 'en' ? 'Please select your town.' : 'దయచేసి మీ టౌన్ ఎంచుకోండి.');
      hasError = true;
    }
    if (!villageId) {
      setVillageError(language === 'en' ? 'Please select your village.' : 'దయచేసి మీ గ్రామాన్ని ఎంచుకోండి.');
      hasError = true;
    }
    if (hasError) return;

    // Verify village belongs to town
    const village = villages.find(v => v.id === villageId);
    if (!village) {
      setVillageError(language === 'en' ? 'Invalid village selection.' : 'చెల్లని గ్రామం ఎంపిక.');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ town_id: townId, village_id: villageId })
      .eq('user_id', user?.id);

    if (error) {
      console.error('[LocationSelector] save error:', error);
      toast.error(language === 'en' ? 'Failed to save location' : 'లొకేషన్ సేవ్ విఫలం');
    } else {
      toast.success(language === 'en' ? 'Location saved' : 'లొకేషన్ సేవ్ అయింది');
    }
    setSaving(false);
  };

  const labels = {
    sectionTitle: language === 'en' ? 'Location' : 'లొకేషన్',
    town: language === 'en' ? 'Town *' : 'టౌన్ *',
    selectTown: language === 'en' ? 'Select Town' : 'టౌన్ ఎంచుకోండి',
    village: language === 'en' ? 'Village *' : 'గ్రామం *',
    selectVillage: language === 'en' ? 'Select Village' : 'గ్రామం ఎంచుకోండి',
    save: language === 'en' ? 'Save Location' : 'లొకేషన్ సేవ్ చేయండి',
  };

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
        {labels.sectionTitle}
      </p>
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">{labels.sectionTitle}</p>
        </div>

        {/* Town */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{labels.town}</label>
          {townsLoading ? (
            <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'en' ? 'Loading towns...' : 'టౌన్లు లోడ్ అవుతున్నాయి...'}
            </div>
          ) : (
            <Select value={townId} onValueChange={handleTownChange}>
              <SelectTrigger>
                <SelectValue placeholder={labels.selectTown} />
              </SelectTrigger>
              <SelectContent>
                {towns.map(town => (
                  <SelectItem key={town.id} value={town.id}>{town.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {townError && <p className="text-xs text-destructive">{townError}</p>}
        </div>

        {/* Village */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{labels.village}</label>
          {villagesLoading ? (
            <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'en' ? 'Loading villages...' : 'గ్రామాలు లోడ్ అవుతున్నాయి...'}
            </div>
          ) : (
            <Select value={villageId} onValueChange={handleVillageChange} disabled={!townId}>
              <SelectTrigger>
                <SelectValue placeholder={labels.selectVillage} />
              </SelectTrigger>
              <SelectContent>
                {villages.map(village => (
                  <SelectItem key={village.id} value={village.id}>{village.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {villageError && <p className="text-xs text-destructive">{villageError}</p>}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {labels.save}
        </button>
      </div>
    </div>
  );
}
