import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  IndianRupee, Check, Loader2, RefreshCw,
  ChevronRight, X, TrendingUp, Clock, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Settlement {
  id: string;
  merchant_id: string;
  order_id: string;
  gross_amount: number;
  commission: number;
  net_amount: number;
  settlement_status: string;
  created_at: string;
  merchant_name?: string;
  merchant_phone?: string;
}

function useSettlements() {
  return useQuery({
    queryKey: ['admin-settlements'],
    queryFn: async (): Promise<Settlement[]> => {
      const { data, error } = await supabase
        .from('settlements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const merchantIds = [...new Set(data.map((s: any) => s.merchant_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, phone')
        .in('user_id', merchantIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      return data.map((s: any) => ({
        ...s,
        gross_amount: Number(s.gross_amount),
        commission: Number(s.commission),
        net_amount: Number(s.net_amount),
        merchant_name: profileMap.get(s.merchant_id)?.display_name || null,
        merchant_phone: profileMap.get(s.merchant_id)?.phone || null,
      }));
    },
  });
}

function useMarkSettled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settlementId: string) => {
      const { error } = await supabase
        .from('settlements')
        .update({ settlement_status: 'paid' })
        .eq('id', settlementId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

export function AdminSettlementsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';
  const { data: settlements = [], isLoading, refetch } = useSettlements();
  const markSettled = useMarkSettled();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [selected, setSelected] = useState<Settlement | null>(null);

  const filtered = settlements.filter(s =>
    filter === 'all' || s.settlement_status === filter
  );

  // Group by merchant for summary
  const merchantSummary = settlements.reduce((acc, s) => {
    const key = s.merchant_id;
    if (!acc[key]) {
      acc[key] = {
        merchant_id: key,
        merchant_name: s.merchant_name,
        merchant_phone: s.merchant_phone,
        total_gross: 0,
        total_commission: 0,
        total_net: 0,
        pending_amount: 0,
        paid_amount: 0,
      };
    }
    acc[key].total_gross += s.gross_amount;
    acc[key].total_commission += s.commission;
    acc[key].total_net += s.net_amount;
    if (s.settlement_status === 'pending') acc[key].pending_amount += s.net_amount;
    if (s.settlement_status === 'paid') acc[key].paid_amount += s.net_amount;
    return acc;
  }, {} as Record<string, any>);

  const totalPending = settlements
    .filter(s => s.settlement_status === 'pending')
    .reduce((sum, s) => sum + s.net_amount, 0);
  const totalPaid = settlements
    .filter(s => s.settlement_status === 'paid')
    .reduce((sum, s) => sum + s.net_amount, 0);
  const totalCommission = settlements.reduce((sum, s) => sum + s.commission, 0);

  const handleMarkPaid = async (settlement: Settlement) => {
    try {
      await markSettled.mutateAsync(settlement.id);
      toast.success(en ? 'Marked as paid ✅' : 'చెల్లించినట్లు గుర్తించబడింది ✅');
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      <header className="px-5 pt-8 pb-4 sticky top-0 z-10 bg-background border-b border-foreground/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {en ? 'Admin' : 'అడ్మిన్'}
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              {en ? 'Settlements' : 'సెటిల్‌మెంట్లు'}
            </h1>
          </div>
          <button onClick={() => refetch()}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: en ? 'Pending' : 'పెండింగ్', value: `₹${Math.round(totalPending)}`, color: 'text-amber-600' },
            { label: en ? 'Paid Out' : 'చెల్లించిన', value: `₹${Math.round(totalPaid)}`, color: 'text-green-600' },
            { label: en ? 'Commission' : 'కమిషన్', value: `₹${Math.round(totalCommission)}`, color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl shadow-sm p-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Merchant Summary */}
        {Object.values(merchantSummary).length > 0 && (
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-foreground/5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {en ? 'By Merchant' : 'వ్యాపారి వారీగా'}
              </p>
            </div>
            {Object.values(merchantSummary).map((m: any) => (
              <div key={m.merchant_id} className="px-4 py-3 border-b border-foreground/5 last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {m.merchant_name || (en ? 'Unknown Merchant' : 'తెలియని వ్యాపారి')}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.merchant_phone || '—'}</p>
                  </div>
                  <div className="text-right">
                    {m.pending_amount > 0 && (
                      <p className="text-sm font-bold text-amber-600">
                        ₹{Math.round(m.pending_amount)} {en ? 'pending' : 'పెండింగ్'}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      ₹{Math.round(m.paid_amount)} {en ? 'paid' : 'చెల్లించిన'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'pending', 'paid'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
              {f === 'all' ? (en ? 'All' : 'అన్నీ') :
               f === 'pending' ? (en ? 'Pending' : 'పెండింగ్') :
               (en ? 'Paid' : 'చెల్లించిన')}
              <span className="ml-1 opacity-70">
                ({settlements.filter(s => f === 'all' || s.settlement_status === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Settlement List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <IndianRupee className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {en ? 'No settlements found' : 'సెటిల్‌మెంట్లు కనుగొనబడలేదు'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(s => (
              <button key={s.id} onClick={() => setSelected(s)}
                className="w-full bg-card rounded-2xl shadow-sm p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      s.settlement_status === 'paid' ? 'bg-green-500/10' : 'bg-amber-500/10'
                    }`}>
                      {s.settlement_status === 'paid'
                        ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                        : <Clock className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {s.merchant_name || (en ? 'Unknown' : 'తెలియదు')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString(
                          en ? 'en-IN' : 'te-IN',
                          { day: 'numeric', month: 'short' }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{Math.round(s.net_amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.settlement_status === 'paid'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {s.settlement_status === 'paid'
                        ? (en ? 'Paid' : 'చెల్లించిన')
                        : (en ? 'Pending' : 'పెండింగ్')}
                    </span>
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
                {en ? 'Settlement Details' : 'సెటిల్‌మెంట్ వివరాలు'}
              </h3>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="bg-muted/40 rounded-2xl p-4 space-y-3">
                {[
                  { label: en ? 'Merchant' : 'వ్యాపారి', value: selected.merchant_name || '—' },
                  { label: en ? 'Phone' : 'ఫోన్', value: selected.merchant_phone || '—' },
                  { label: en ? 'Order ID' : 'ఆర్డర్ ID', value: `#${selected.order_id.slice(0, 8).toUpperCase()}` },
                  { label: en ? 'Date' : 'తేదీ', value: new Date(selected.created_at).toLocaleDateString(en ? 'en-IN' : 'te-IN') },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Amount Breakdown */}
              <div className="bg-card rounded-2xl p-4 space-y-2 border border-foreground/5">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{en ? 'Gross Amount' : 'స్థూల మొత్తం'}</span>
                  <span className="text-sm font-medium">₹{Math.round(selected.gross_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{en ? 'Commission' : 'కమిషన్'}</span>
                  <span className="text-sm font-medium text-red-600">- ₹{Math.round(selected.commission)}</span>
                </div>
                <div className="h-px bg-foreground/10" />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-foreground">{en ? 'Net Payable' : 'చెల్లించాల్సిన మొత్తం'}</span>
                  <span className="text-lg font-bold text-primary">₹{Math.round(selected.net_amount)}</span>
                </div>
              </div>

              {selected.settlement_status === 'pending' ? (
                <button
                  onClick={() => handleMarkPaid(selected)}
                  disabled={markSettled.isPending}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {markSettled.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Check className="w-4 h-4" />}
                  {en ? 'Mark as Paid' : 'చెల్లించినట్లు గుర్తించండి'}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-green-500/10 text-green-600 font-semibold text-sm text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {en ? 'Already Paid' : 'ఇప్పటికే చెల్లించబడింది'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






