import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  MapPin, Edit2, Check, X, Info, Loader2, RefreshCw, IndianRupee,
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

function useVillages() {
  return useQuery({
    queryKey: ['admin-villages'],
    queryFn: async (): Promise<Village[]> => {
      const { data, error } = await supabase
        .from('villages')
        .select('id, name, delivery_fee, min_order, distance_km, town_id')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });
}

function useUpdateVillage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, delivery_fee, min_order,
    }: { id: string; delivery_fee: number; min_order: number }) => {
      const { error } = await supabase
        .from('villages')
        .update({ delivery_fee, min_order })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-villages'] });
      queryClient.invalidateQueries({ queryKey: ['villages'] });
    },
  });
}

export function AdminFeesPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';
  const { data: villages = [], isLoading, refetch } = useVillages();
  const updateVillage = useUpdateVillage();

  const [editing, setEditing] = useState<Village | null>(null);
  const [editFee, setEditFee] = useState('');
  const [editMinOrder, setEditMinOrder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVillages = villages.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (village: Village) => {
    setEditing(village);
    setEditFee(String(village.delivery_fee ?? 0));
    setEditMinOrder(String(village.min_order ?? 0));
  };

  const handleSave = async () => {
    if (!editing) return;
    const fee = parseFloat(editFee);
    const minOrder = parseFloat(editMinOrder);
    if (isNaN(fee) || fee < 0) {
      toast.error(en ? 'Invalid delivery fee' : 'చెల్లని డెలివరీ ఫీ');
      return;
    }
    if (isNaN(minOrder) || minOrder < 0) {
      toast.error(en ? 'Invalid minimum order' : 'చెల్లని కనిష్ట ఆర్డర్');
      return;
    }
    try {
      await updateVillage.mutateAsync({
        id: editing.id,
        delivery_fee: fee,
        min_order: minOrder,
      });
      toast.success(en ? `${editing.name} fees updated ✅` : `${editing.name} ఫీస్ అప్‌డేట్ అయింది ✅`);
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || (en ? 'Update failed' : 'అప్‌డేట్ విఫలమైంది'));
    }
  };

  // Summary stats
  const avgFee = villages.length
    ? Math.round(villages.reduce((s, v) => s + (v.delivery_fee || 0), 0) / villages.length)
    : 0;
  const freeVillages = villages.filter(v => (v.delivery_fee || 0) === 0).length;
  const maxFee = villages.length
    ? Math.max(...villages.map(v => v.delivery_fee || 0))
    : 0;

  return (
    <div className="mobile-container min-h-screen bg-background pb-28">

      {/* Header */}
      <header className="px-5 pt-8 pb-4 sticky top-0 z-10 bg-background border-b border-foreground/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {en ? 'Admin' : 'అడ్మిన్'}
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              {en ? 'Delivery Fees' : 'డెలివరీ ఫీస్'}
            </h1>
          </div>
          <button
            onClick={() => refetch()}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">

        {/* Info Banner */}
        <div className="bg-primary/8 rounded-2xl p-4 flex items-start gap-3 border border-primary/15">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-primary leading-relaxed">
            {en
              ? 'Set delivery fee and minimum order per village. Changes take effect immediately for new orders.'
              : 'ప్రతి గ్రామానికి డెలివరీ ఫీ మరియు కనిష్ట ఆర్డర్ నిర్ణయించండి. మార్పులు వెంటనే కొత్త ఆర్డర్లకు వర్తిస్తాయి.'}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: en ? 'Villages' : 'గ్రామాలు',
              value: villages.length,
              color: 'text-foreground',
            },
            {
              label: en ? 'Avg Fee' : 'సగటు ఫీ',
              value: `₹${avgFee}`,
              color: 'text-primary',
            },
            {
              label: en ? 'Free Delivery' : 'ఉచిత డెలివరీ',
              value: freeVillages,
              color: 'text-green-600',
            },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-xl shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={en ? 'Search village...' : 'గ్రామం వెతకండి...'}
            className="pl-9 rounded-xl"
          />
        </div>

        {/* Village Fee List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredVillages.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {en ? 'No villages found' : 'గ్రామాలు కనుగొనబడలేదు'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVillages.map((village) => (
              <div
                key={village.id}
                className="bg-card rounded-2xl shadow-sm p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{village.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className={`text-xs font-medium ${
                          (village.delivery_fee || 0) === 0
                            ? 'text-green-600'
                            : 'text-foreground'
                        }`}>
                          {(village.delivery_fee || 0) === 0
                            ? (en ? '🎉 Free delivery' : '🎉 ఉచిత డెలివరీ')
                            : `₹${village.delivery_fee} ${en ? 'delivery' : 'డెలివరీ'}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {en ? 'Min' : 'కనిష్ట'}: ₹{village.min_order || 0}
                        </span>
                        {village.distance_km && (
                          <span className="text-xs text-muted-foreground">
                            {village.distance_km} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(village)}
                    className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fee Range Note */}
        {villages.length > 0 && (
          <div className="bg-muted/40 rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {en
                ? `Delivery fees range: ₹0 — ₹${maxFee} across ${villages.length} villages`
                : `డెలివరీ ఫీ పరిధి: ₹0 — ₹${maxFee}, ${villages.length} గ్రామాలలో`}
            </p>
          </div>
        )}
      </div>

      {/* ── Edit Sheet ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden">
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/5">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{editing.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {en ? 'Edit delivery fee & minimum order' : 'డెలివరీ ఫీ మరియు కనిష్ట ఆర్డర్ మార్చండి'}
                </p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">

              {/* Village Info */}
              {editing.distance_km && (
                <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {en
                      ? `${editing.distance_km} km from town center`
                      : `పట్టణ కేంద్రం నుండి ${editing.distance_km} కి.మీ`}
                  </p>
                </div>
              )}

              {/* Delivery Fee */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Delivery Fee (₹)' : 'డెలివరీ ఫీ (₹)'}
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={editFee}
                    onChange={(e) => setEditFee(e.target.value)}
                    className="pl-9 rounded-xl text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-muted-foreground px-1">
                  {en ? 'Set to 0 for free delivery' : '0 ఉంటే ఉచిత డెలివరీ'}
                </p>
              </div>

              {/* Minimum Order */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Minimum Order (₹)' : 'కనిష్ట ఆర్డర్ (₹)'}
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={editMinOrder}
                    onChange={(e) => setEditMinOrder(e.target.value)}
                    className="pl-9 rounded-xl text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-muted-foreground px-1">
                  {en
                    ? 'Customer must order at least this amount'
                    : 'కస్టమర్ కనీసం ఈ మొత్తం ఆర్డర్ చేయాలి'}
                </p>
              </div>

              {/* Preview */}
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                <p className="text-xs font-semibold text-primary mb-1">
                  {en ? 'Preview' : 'ప్రివ్యూ'}
                </p>
                <p className="text-sm text-foreground">
                  {parseFloat(editFee) === 0
                    ? (en ? `${editing.name}: Free delivery` : `${editing.name}: ఉచిత డెలివరీ`)
                    : (en
                        ? `${editing.name}: ₹${editFee || 0} delivery fee`
                        : `${editing.name}: ₹${editFee || 0} డెలివరీ ఫీ`)}
                  {parseFloat(editMinOrder) > 0 && (
                    <span className="text-muted-foreground">
                      {en ? `, min order ₹${editMinOrder}` : `, కనిష్ట ₹${editMinOrder}`}
                    </span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pb-2">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 rounded-xl border border-foreground/10 text-foreground font-medium text-sm"
                >
                  {en ? 'Cancel' : 'రద్దు'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateVillage.isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updateVillage.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {en ? 'Save' : 'సేవ్'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






