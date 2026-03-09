import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, Search, ShoppingBag, Loader2,
  RefreshCw, ChevronRight, X, Ban, CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Customer {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  roles: string[];
  delivery_address: string | null;
  created_at: string | null;
  order_count?: number;
  total_spent?: number;
}

function useCustomers() {
  return useQuery({
    queryKey: ['admin-customers'],
    queryFn: async (): Promise<Customer[]> => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, phone, roles, delivery_address, created_at')
        .contains('roles', ['customer'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!profiles || profiles.length === 0) return [];

      // Get order stats per customer
      const userIds = profiles.map((p: any) => p.user_id);
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, total_amount')
        .in('user_id', userIds);

      const statsMap: Record<string, { count: number; total: number }> = {};
      (orders || []).forEach((o: any) => {
        if (!statsMap[o.user_id]) statsMap[o.user_id] = { count: 0, total: 0 };
        statsMap[o.user_id].count++;
        statsMap[o.user_id].total += Number(o.total_amount || 0);
      });

      return profiles.map((p: any) => ({
        ...p,
        order_count: statsMap[p.user_id]?.count || 0,
        total_spent: statsMap[p.user_id]?.total || 0,
      }));
    },
  });
}

export function AdminCustomersPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';
  const queryClient = useQueryClient();
  const { data: customers = [], isLoading, refetch } = useCustomers();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');

  const isBlocked = (c: Customer) => c.roles.includes('blocked');

  const filtered = customers.filter(c => {
    const matchSearch =
      (c.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search);
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && !isBlocked(c)) ||
      (filter === 'blocked' && isBlocked(c));
    return matchSearch && matchFilter;
  });

  const handleToggleBlock = async (customer: Customer) => {
    const blocked = isBlocked(customer);
    const newRoles = blocked
      ? customer.roles.filter(r => r !== 'blocked')
      : [...customer.roles, 'blocked'];
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ roles: newRoles })
        .eq('user_id', customer.user_id);
      if (error) throw error;
      toast.success(
        blocked
          ? (en ? 'Customer unblocked ✅' : 'కస్టమర్ అన్‌బ్లాక్ చేయబడ్డారు ✅')
          : (en ? 'Customer blocked' : 'కస్టమర్ బ్లాక్ చేయబడ్డారు')
      );
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Stats
  const activeCount = customers.filter(c => !isBlocked(c)).length;
  const blockedCount = customers.filter(isBlocked).length;
  const totalRevenue = customers.reduce((s, c) => s + (c.total_spent || 0), 0);

  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      <header className="px-5 pt-8 pb-4 sticky top-0 z-10 bg-background border-b border-foreground/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {en ? 'Admin' : 'అడ్మిన్'}
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              {en ? 'Customers' : 'కస్టమర్లు'}
            </h1>
          </div>
          <button onClick={() => refetch()}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: en ? 'Total' : 'మొత్తం', value: customers.length, color: 'text-foreground' },
            { label: en ? 'Active' : 'యాక్టివ్', value: activeCount, color: 'text-green-600' },
            { label: en ? 'Revenue' : 'ఆదాయం', value: `₹${Math.round(totalRevenue / 1000)}K`, color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'active', 'blocked'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
              {f === 'all' ? (en ? 'All' : 'అన్నీ') :
               f === 'active' ? (en ? 'Active' : 'యాక్టివ్') :
               (en ? 'Blocked' : 'బ్లాక్')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={en ? 'Search customer...' : 'కస్టమర్ వెతకండి...'}
            className="pl-9 rounded-xl" />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {en ? 'No customers found' : 'కస్టమర్లు కనుగొనబడలేదు'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(customer => (
              <button key={customer.user_id} onClick={() => setSelected(customer)}
                className="w-full bg-card rounded-2xl shadow-sm p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isBlocked(customer) ? 'bg-red-500/10' : 'bg-primary/10'
                    }`}>
                      <Users className={`w-5 h-5 ${isBlocked(customer) ? 'text-red-500' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {customer.display_name || (en ? 'Unknown' : 'తెలియదు')}
                        {isBlocked(customer) && (
                          <span className="ml-2 text-xs text-red-600 font-normal">
                            🚫 {en ? 'Blocked' : 'బ్లాక్'}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{customer.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-primary">
                      {customer.order_count} {en ? 'orders' : 'ఆర్డర్లు'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{Math.round(customer.total_spent || 0)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/5">
              <h3 className="font-semibold text-lg text-foreground">
                {selected.display_name || (en ? 'Customer' : 'కస్టమర్')}
              </h3>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: en ? 'Total Orders' : 'మొత్తం ఆర్డర్లు', value: selected.order_count || 0, color: 'text-primary' },
                  { label: en ? 'Total Spent' : 'మొత్తం ఖర్చు', value: `₹${Math.round(selected.total_spent || 0)}`, color: 'text-green-600' },
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
                  <span className={`text-sm font-semibold ${isBlocked(selected) ? 'text-red-600' : 'text-green-600'}`}>
                    {isBlocked(selected)
                      ? (en ? '🚫 Blocked' : '🚫 బ్లాక్')
                      : (en ? '✅ Active' : '✅ యాక్టివ్')}
                  </span>
                </div>
                {selected.delivery_address && (
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">{en ? 'Address' : 'చిరునామా'}</span>
                    <span className="text-xs text-foreground text-right max-w-[60%]">
                      {selected.delivery_address}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleToggleBlock(selected)}
                className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                  isBlocked(selected)
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-red-500/10 text-red-600'
                }`}>
                {isBlocked(selected)
                  ? <><CheckCircle2 className="w-4 h-4" /> {en ? 'Unblock Customer' : 'అన్‌బ్లాక్ చేయండి'}</>
                  : <><Ban className="w-4 h-4" /> {en ? 'Block Customer' : 'బ్లాక్ చేయండి'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






