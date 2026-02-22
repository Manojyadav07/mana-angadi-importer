import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Check, ArrowRight, ShoppingBasket } from 'lucide-react';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const en = language === 'en';

  // Gather order IDs from state or query string
  const stateIds: string[] = location.state?.orderIds || [];
  const queryIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const orderIds = stateIds.length > 0 ? stateIds : queryIds;

  const displayName = profile?.display_name || user?.email?.split('@')[0] || (en ? 'Friend' : 'మిత్రమా');

  const { data: orders } = useQuery({
    queryKey: ['success-orders', orderIds],
    queryFn: async () => {
      if (!orderIds.length) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('id, shop_id, total_amount, status')
        .in('id', orderIds);
      if (error) throw error;
      if (!data?.length) return [];

      const shopIds = [...new Set(data.map(o => o.shop_id))];
      const { data: shops } = await supabase.from('shops').select('id, name').in('id', shopIds);
      const shopMap = new Map((shops || []).map(s => [s.id, s.name]));

      return data.map(o => ({
        id: o.id,
        shopName: shopMap.get(o.shop_id) || 'Village Shop',
        total: Number(o.total_amount),
        status: o.status || 'placed',
      }));
    },
    enabled: orderIds.length > 0,
  });

  const hasOrders = orders && orders.length > 0;
  const isSingle = orders?.length === 1;

  // No order IDs provided
  if (!orderIds.length) {
    return (
      <div className="screen-shell min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F9F8F4' }}>
        <p className="text-foreground/60 text-center mb-6">{en ? 'No order information found.' : 'ఆర్డర్ సమాచారం కనుగొనబడలేదు.'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl"
        >
          {en ? 'Go to Orders' : 'ఆర్డర్లకు వెళ్ళండి'}
        </button>
      </div>
    );
  }

  return (
    <div className="screen-shell min-h-screen relative overflow-hidden" style={{ background: '#F9F8F4' }}>
      {/* Decorative blurred blobs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-40 h-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-6 pt-14 pb-10">
        {/* Top branding */}
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-foreground/35 font-sans">MANA</p>
          <p className="text-[13px] uppercase tracking-[0.25em] text-foreground/60 font-bold font-sans -mt-0.5">ANGADI</p>
        </div>

        {/* Hero illustration */}
        <div className="relative w-28 h-28 mb-8">
          {/* Soft green glow */}
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl scale-125" />
          <div className="relative w-28 h-28 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center">
            <ShoppingBasket className="w-12 h-12 text-primary/70" strokeWidth={1.5} />
          </div>
          {/* Green check badge */}
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-2xl font-semibold text-foreground text-center mb-2 leading-snug">
          {en ? 'Dhanyavadalu,' : 'ధన్యవాదాలు,'}
          <br />
          <span className="italic">{displayName}</span> {en ? 'Gaaru!' : 'గారు!'}
        </h1>

        {/* Subtext */}
        <p className="text-foreground/55 text-center text-sm mb-8 max-w-xs leading-relaxed">
          {isSingle && hasOrders
            ? (en
              ? `Your order from ${orders[0].shopName} is being hand-prepared.`
              : `${orders[0].shopName} నుండి మీ ఆర్డర్ చేతితో తయారు చేయబడుతోంది.`)
            : (en
              ? 'Your orders are being prepared by our village partners.'
              : 'మీ ఆర్డర్లు మా గ్రామ భాగస్వాములచే తయారు చేయబడుతున్నాయి.')}
        </p>

        {/* Order cards */}
        {hasOrders && (
          <div className="w-full space-y-3 mb-8">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-primary/5 border border-primary/10 rounded-xl p-5 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/50 uppercase tracking-wide">{en ? 'Order Reference' : 'ఆర్డర్ రిఫరెన్స్'}</span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    #MA-{o.id.slice(0, 6).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/50 uppercase tracking-wide">{en ? 'Shop' : 'షాప్'}</span>
                  <span className="text-sm font-medium text-foreground">{o.shopName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/50 uppercase tracking-wide">{en ? 'Total' : 'మొత్తం'}</span>
                  <span className="text-sm font-bold text-foreground">₹{o.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/50 uppercase tracking-wide">{en ? 'Status' : 'స్థితి'}</span>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full capitalize">
                    {en ? 'Placed' : 'ఆర్డర్ చేయబడింది'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <button
          onClick={() => {
            if (isSingle && orders?.[0]) navigate(`/order/${orders[0].id}`);
            else navigate('/orders');
          }}
          className="w-full bg-primary text-white font-semibold text-base py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          {en ? 'Track My Order' : 'నా ఆర్డర్ ట్రాక్ చేయండి'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigate('/home')}
          className="mt-5 text-foreground/45 text-sm font-sans hover:text-foreground/70 transition-colors"
        >
          {en ? 'Back to Home' : 'హోమ్‌కు తిరిగి వెళ్ళండి'}
        </button>
      </div>
    </div>
  );
}
