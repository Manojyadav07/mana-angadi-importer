import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  MapPin, Plus, Edit2, Check, X, Loader2,
  RefreshCw, Search, Navigation,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Village {
  id: string;
  name: string;
  delivery_fee: number;
  min_order: number;
  distance_km: number | null;
  town_id: string | null;
}

interface Town {
  id: string;
  name: string;
}

function useVillagesAdmin() {
  return useQuery({
    queryKey: ['admin-villages-full'],
    queryFn: async () => {
      const [{ data: villages, error }, { data: towns }] = await Promise.all([
        supabase.from('villages').select('*').order('name'),
        supabase.from('towns').select('id, name').order('name'),
      ]);
      if (error) throw error;
      return { villages: (villages || []) as Village[], towns: (towns || []) as Town[] };
    },
  });
}

const EMPTY_VILLAGE = { name: '', delivery_fee: 0, min_order: 0, distance_km: null, town_id: null };

export function AdminVillagesPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useVillagesAdmin();
  const villages = data?.villages || [];
  const towns = data?.towns || [];

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Village | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<Village, 'id'>>(EMPTY_VILLAGE);
  const [saving, setSaving] = useState(false);

  const filtered = villages.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const getTownName = (townId: string | null) =>
    towns.find(t => t.id === townId)?.name || '—';

  const handleEdit = (v: Village) => {
    setEditing(v);
    setForm({
      name: v.name,
      delivery_fee: v.delivery_fee,
      min_order: v.min_order,
      distance_km: v.distance_km,
      town_id: v.town_id,
    });
    setIsAdding(false);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm(EMPTY_VILLAGE);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error(en ? 'Village name is required' : 'గ్రామం పేరు అవసరం');
      return;
    }
    setSaving(true);
    try {
      if (isAdding) {
        const { error } = await supabase.from('villages').insert({
          name: form.name.trim(),
          delivery_fee: form.delivery_fee || 0,
          min_order: form.min_order || 0,
          distance_km: form.distance_km || null,
          town_id: form.town_id || null,
        });
        if (error) throw error;
        toast.success(en ? `${form.name} added ✅` : `${form.name} జోడించబడింది ✅`);
      } else if (editing) {
        const { error } = await supabase.from('villages').update({
          name: form.name.trim(),
          delivery_fee: form.delivery_fee || 0,
          min_order: form.min_order || 0,
          distance_km: form.distance_km || null,
          town_id: form.town_id || null,
        }).eq('id', editing.id);
        if (error) throw error;
        toast.success(en ? `${form.name} updated ✅` : `${form.name} అప్‌డేట్ అయింది ✅`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-villages-full'] });
      queryClient.invalidateQueries({ queryKey: ['admin-villages'] });
      queryClient.invalidateQueries({ queryKey: ['villages'] });
      setEditing(null);
      setIsAdding(false);
    } catch (err: any) {
      toast.error(err.message || (en ? 'Save failed' : 'సేవ్ విఫలమైంది'));
    } finally {
      setSaving(false);
    }
  };

  const showSheet = editing !== null || isAdding;

  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      <header className="px-5 pt-8 pb-4 sticky top-0 z-10 bg-background border-b border-foreground/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {en ? 'Admin' : 'అడ్మిన్'}
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              {en ? 'Villages' : 'గ్రామాలు'}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => refetch()}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={handleAdd}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: en ? 'Villages' : 'గ్రామాలు', value: villages.length, color: 'text-foreground' },
            { label: en ? 'Towns' : 'పట్టణాలు', value: towns.length, color: 'text-primary' },
            { label: en ? 'Free Delivery' : 'ఉచిత డెలివరీ', value: villages.filter(v => !v.delivery_fee).length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={en ? 'Search village...' : 'గ్రామం వెతకండి...'}
            className="pl-9 rounded-xl" />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {en ? 'No villages found' : 'గ్రామాలు కనుగొనబడలేదు'}
            </p>
            <button onClick={handleAdd}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              + {en ? 'Add First Village' : 'మొదటి గ్రామం జోడించండి'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(village => (
              <div key={village.id} className="bg-card rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{village.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className={`text-xs font-medium ${
                          !village.delivery_fee ? 'text-green-600' : 'text-foreground'
                        }`}>
                          {!village.delivery_fee
                            ? (en ? 'Free delivery' : 'ఉచిత డెలివరీ')
                            : `₹${village.delivery_fee} ${en ? 'fee' : 'ఫీ'}`}
                        </span>
                        {village.distance_km && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {village.distance_km} km
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {getTownName(village.town_id)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleEdit(village)}
                    className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/5">
              <h3 className="font-semibold text-lg text-foreground">
                {isAdding
                  ? (en ? 'Add Village' : 'గ్రామం జోడించు')
                  : (en ? `Edit ${editing?.name}` : `${editing?.name} సవరించు`)}
              </h3>
              <button onClick={() => { setEditing(null); setIsAdding(false); }}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
              {/* Village Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Village Name *' : 'గ్రామం పేరు *'}
                </label>
                <Input value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={en ? 'e.g. Metpally' : 'ఉదా. మెట్‌పల్లి'}
                  className="rounded-xl" />
              </div>

              {/* Town */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Assign to Town' : 'పట్టణానికి కేటాయించండి'}
                </label>
                <select
                  value={form.town_id || ''}
                  onChange={(e) => setForm({ ...form, town_id: e.target.value || null })}
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm"
                >
                  <option value="">{en ? '— Select Town —' : '— పట్టణం ఎంచుకోండి —'}</option>
                  {towns.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Distance */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Distance from Town (km)' : 'పట్టణం నుండి దూరం (కి.మీ)'}
                </label>
                <Input type="number" min="0" step="0.1"
                  value={form.distance_km || ''}
                  onChange={(e) => setForm({ ...form, distance_km: parseFloat(e.target.value) || null })}
                  placeholder="0.0"
                  className="rounded-xl" />
              </div>

              {/* Delivery Fee */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Delivery Fee (₹)' : 'డెలివరీ ఫీ (₹)'}
                </label>
                <Input type="number" min="0"
                  value={form.delivery_fee}
                  onChange={(e) => setForm({ ...form, delivery_fee: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="rounded-xl" />
                <p className="text-xs text-muted-foreground">
                  {en ? 'Set 0 for free delivery' : '0 ఉంటే ఉచిత డెలివరీ'}
                </p>
              </div>

              {/* Min Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Minimum Order (₹)' : 'కనిష్ట ఆర్డర్ (₹)'}
                </label>
                <Input type="number" min="0"
                  value={form.min_order}
                  onChange={(e) => setForm({ ...form, min_order: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="rounded-xl" />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pb-4">
                <button
                  onClick={() => { setEditing(null); setIsAdding(false); }}
                  className="flex-1 py-3 rounded-xl border border-foreground/10 text-foreground font-medium text-sm">
                  {en ? 'Cancel' : 'రద్దు'}
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isAdding ? (en ? 'Add Village' : 'జోడించు') : (en ? 'Save Changes' : 'సేవ్')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






