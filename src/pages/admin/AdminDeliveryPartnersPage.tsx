import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Truck, Search, Check, X, Loader2,
  RefreshCw, ChevronRight, Phone, Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DeliveryPartner {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  roles: string[];
}

interface DeliveryPartnerStats {
  user_id: string;
  total_deliveries: number;
  total_earnings: number;
}

function useDeliveryPartners() {
  return useQuery({
    queryKey: ['admin-delivery-partners'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, phone, roles')
        .contains('roles', ['delivery']);
      if (error) throw error;

      // Get delivery stats per partner
      const userIds = (profiles || []).map((p: any) => p.user_id);
      let stats: DeliveryPartnerStats[] = [];
      if (userIds.length > 0) {
        const { data: orders } = await supabase
          .from('orders')
          .select('delivery_person_id, total_amount')
          .in('delivery_person_id', userIds)
          .eq('status', 'delivered');

        if (orders) {
          const statsMap: Record<string, DeliveryPartnerStats> = {};
          orders.forEach((o: any) => {
            const uid = o.delivery_person_id;
            if (!statsMap[uid]) {
              statsMap[uid] = { user_id: uid, total_deliveries: 0, total_earnings: 0 };
            }
            statsMap[uid].total_deliveries++;
            // Estimate partner earnings as 10% of order value
            statsMap[uid].total_earnings += Number(o.total_amount || 0) * 0.1;
          });
          stats = Object.values(statsMap);
        }
      }

      const statsMap = new Map(stats.map(s => [s.user_id, s]));
      return (profiles || []).map((p: any) => ({
        ...p,
        stats: statsMap.get(p.user_id) || { total_deliveries: 0, total_earnings: 0 },
      }));
    },
  });
}

function usePendingDeliveryApps() {
  return useQuery({
    queryKey: ['admin-pending-delivery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_applications')
        .select('*')
        .eq('role', 'delivery')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function AdminDeliveryPartnersPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';
  const queryClient = useQueryClient();
  const { data: partners = [], isLoading, refetch } = useDeliveryPartners();
  const { data: pendingApps = [], refetch: refetchPending } = usePendingDeliveryApps();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'pending'>('active');

  const filtered = partners.filter(p => {
    const name = (p.display_name || '').toLowerCase();
    const phone = (p.phone || '');
    return name.includes(search.toLowerCase()) || phone.includes(search);
  });

  const approveDelivery = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error: appError } = await supabase
        .from('onboarding_applications')
        .update({ status: 'approved' })
        .eq('user_id', userId)
        .eq('role', 'delivery');
      if (appError) throw appError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('user_id', userId)
        .single();

      const currentRoles: string[] = (profile as any)?.roles || [];
      const newRoles = currentRoles.includes('delivery')
        ? currentRoles
        : [...currentRoles, 'delivery'];

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ roles: newRoles })
        .eq('user_id', userId);
      if (profileError) throw profileError;

      toast.success(en ? 'Delivery partner approved ✅' : 'డెలివరీ పార్ట్‌నర్ ఆమోదించబడ్డారు ✅');
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-delivery'] });
      refetch();
      refetchPending();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectDelivery = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('onboarding_applications')
        .update({ status: 'rejected' })
        .eq('user_id', userId)
        .eq('role', 'delivery');
      if (error) throw error;

      toast.success(en ? 'Application rejected' : 'దరఖాస్తు తిరస్కరించబడింది');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-delivery'] });
      refetchPending();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const totalDeliveries = partners.reduce((s, p) => s + (p.stats?.total_deliveries || 0), 0);
  const totalEarnings = partners.reduce((s, p) => s + (p.stats?.total_earnings || 0), 0);

  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      <header className="px-5 pt-8 pb-4 sticky top-0 z-10 bg-background border-b border-foreground/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {en ? 'Admin' : 'అడ్మిన్'}
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              {en ? 'Delivery Partners' : 'డెలివరీ పార్ట్‌నర్లు'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {pendingApps.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pendingApps.length}
              </span>
            )}
            <button onClick={() => refetch()}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: en ? 'Partners' : 'పార్ట్‌నర్లు', value: partners.length, color: 'text-foreground' },
            { label: en ? 'Deliveries' : 'డెలివరీలు', value: totalDeliveries, color: 'text-primary' },
            { label: en ? 'Pending' : 'పెండింగ్', value: pendingApps.length, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab */}
        <div className="flex items-center bg-muted rounded-xl p-1">
          {(['active', 'pending'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}>
              {t === 'active'
                ? (en ? `Active (${partners.length})` : `యాక్టివ్ (${partners.length})`)
                : (en ? `Pending (${pendingApps.length})` : `పెండింగ్ (${pendingApps.length})`)}
            </button>
          ))}
        </div>

        {/* Active Partners */}
        {tab === 'active' && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={en ? 'Search partner...' : 'పార్ట్‌నర్ వెతకండి...'}
                className="pl-9 rounded-xl" />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Truck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {en ? 'No delivery partners yet' : 'డెలివరీ పార్ట్‌నర్లు లేరు'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((partner) => (
                  <button key={partner.user_id}
                    onClick={() => setSelected(partner)}
                    className="w-full bg-card rounded-2xl shadow-sm p-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                          🏍️
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {partner.display_name || (en ? 'Unknown' : 'తెలియదు')}
                          </p>
                          <p className="text-xs text-muted-foreground">{partner.phone || '—'}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-primary font-medium">
                              {partner.stats?.total_deliveries || 0} {en ? 'deliveries' : 'డెలివరీలు'}
                            </span>
                            <span className="text-xs text-green-600 font-medium">
                              ₹{Math.round(partner.stats?.total_earnings || 0)} {en ? 'earned' : 'సంపాదన'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pending Applications */}
        {tab === 'pending' && (
          <div className="space-y-3">
            {pendingApps.length === 0 ? (
              <div className="text-center py-16">
                <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {en ? 'No pending applications' : 'పెండింగ్ దరఖాస్తులు లేవు'}
                </p>
              </div>
            ) : (
              pendingApps.map((app: any) => (
                <div key={app.id} className="bg-card rounded-2xl shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {app.user_id.slice(0, 12)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString(
                            en ? 'en-IN' : 'te-IN',
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )}
                        </p>
                        {app.form_data?.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {app.form_data.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                      {en ? 'Pending' : 'పెండింగ్'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectDelivery(app.user_id)}
                      disabled={actionLoading === app.user_id}
                      className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-600 text-sm font-semibold flex items-center justify-center gap-1"
                    >
                      {actionLoading === app.user_id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <X className="w-4 h-4" />}
                      {en ? 'Reject' : 'తిరస్కరించు'}
                    </button>
                    <button
                      onClick={() => approveDelivery(app.user_id)}
                      disabled={actionLoading === app.user_id}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1"
                    >
                      {actionLoading === app.user_id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Check className="w-4 h-4" />}
                      {en ? 'Approve' : 'ఆమోదించు'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Partner Detail Sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/5">
              <h3 className="font-semibold text-lg text-foreground">
                {selected.display_name || (en ? 'Delivery Partner' : 'డెలివరీ పార్ట్‌నర్')}
              </h3>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: en ? 'Total Deliveries' : 'మొత్తం డెలివరీలు', value: selected.stats?.total_deliveries || 0, color: 'text-primary' },
                  { label: en ? 'Total Earned' : 'మొత్తం సంపాదన', value: `₹${Math.round(selected.stats?.total_earnings || 0)}`, color: 'text-green-600' },
                ].map(s => (
                  <div key={s.label} className="bg-muted/40 rounded-xl p-3 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{en ? 'Phone' : 'ఫోన్'}</span>
                  <span className="text-sm font-medium">{selected.phone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{en ? 'Status' : 'స్థితి'}</span>
                  <span className="text-sm font-semibold text-green-600">
                    {en ? 'Active' : 'యాక్టివ్'}
                  </span>
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <p className="text-xs text-primary">
                  {en
                    ? 'Earnings calculated at 10% of delivered order value'
                    : 'డెలివరీ అయిన ఆర్డర్ విలువలో 10% సంపాదన'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






