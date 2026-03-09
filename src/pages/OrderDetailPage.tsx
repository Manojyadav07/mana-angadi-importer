import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Loader2, MapPin, Phone, Pencil, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

const FALLBACK = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=60';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';

  const { data: order, isLoading, refetch } = useOrder(orderId);

  const [editingAddress, setEditingAddress] = useState(false);
  const [doorNumber, setDoorNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const canEdit = order?.status === 'pending' || order?.status === 'placed';

  const parseAddress = (raw: string | null) => {
    if (!raw) return { door: '', landmark: '' };
    const parts = raw.split('|');
    return { door: parts[0]?.trim() || '', landmark: parts[1]?.trim() || '' };
  };

  const handleEditStart = () => {
    const parsed = parseAddress((order as any)?.delivery_address);
    setDoorNumber(parsed.door);
    setLandmark(parsed.landmark);
    setDeliveryPhone((order as any)?.delivery_phone || '');
    setEditingAddress(true);
  };

  const handleSaveAddress = async () => {
    if (!doorNumber.trim()) {
      toast.error(en ? 'Door number is required' : 'తలుపు నంబర్ అవసరం');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('orders')
      .update({
        delivery_address: `${doorNumber.trim()} | ${landmark.trim()}`,
        delivery_phone: deliveryPhone.trim(),
      } as any)
      .eq('id', orderId);

    if (error) {
      toast.error(en ? 'Failed to update address' : 'చిరునామా అప్‌డేట్ విఫలం');
    } else {
      toast.success(en ? 'Address updated' : 'చిరునామా అప్‌డేట్ అయింది');
      setEditingAddress(false);
      refetch();
    }
    setSaving(false);
  };

  const statusLabel = (s: string | null) => {
    const map: Record<string, { en: string; te: string }> = {
      placed:           { en: 'Placed',           te: 'ఆర్డర్ చేయబడింది' },
      pending:          { en: 'Pending',           te: 'పెండింగ్' },
      confirmed:        { en: 'Confirmed',         te: 'నిర్ధారించబడింది' },
      assigned:         { en: 'Assigned',          te: 'కేటాయించబడింది' },
      out_for_delivery: { en: 'Out for Delivery',  te: 'డెలివరీలో' },
      delivered:        { en: 'Delivered',         te: 'డెలివరీ అయింది' },
      cancelled:        { en: 'Cancelled',         te: 'రద్దు' },
    };
    const key = s || 'pending';
    return map[key] ? (en ? map[key].en : map[key].te) : key;
  };

  const statusStyle = (s: string | null) => {
    if (s === 'delivered')        return 'bg-primary/15 text-primary';
    if (s === 'cancelled')        return 'bg-destructive/15 text-destructive';
    if (s === 'out_for_delivery') return 'bg-blue-500/15 text-blue-600';
    if (s === 'assigned')         return 'bg-orange-500/15 text-orange-600';
    return 'bg-amber-500/15 text-amber-700';
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!order) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-muted-foreground">{en ? 'Order not found' : 'ఆర్డర్ కనుగొనబడలేదు'}</p>
          <button onClick={() => navigate('/orders')} className="btn-primary-pill px-6 py-3 text-sm font-semibold">
            {en ? 'Back to Orders' : 'ఆర్డర్లకు తిరిగి'}
          </button>
        </div>
      </MobileLayout>
    );
  }

  const parsed = parseAddress((order as any)?.delivery_address);

  return (
    <MobileLayout showNav={false}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-foreground/5">
        <div className="pt-12 px-5 pb-4">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="font-display text-lg font-semibold text-foreground">
                #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-xs text-muted-foreground">{order.shop_name}</p>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <div className="px-5 pt-5 pb-32 space-y-4">

        {/* Status */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">
              {en ? 'Order Status' : 'ఆర్డర్ స్థితి'}
            </p>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle(order.status)}`}>
              {statusLabel(order.status)}
            </span>
          </div>
          {order.created_at && (
            <p className="text-xs text-muted-foreground mt-3">
              {en ? 'Placed on' : 'ఇవ్వబడింది'}: {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </div>

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">
                {en ? 'Delivery Address' : 'డెలివరీ చిరునామా'}
              </p>
            </div>
            {canEdit && !editingAddress && (
              <button onClick={handleEditStart} className="flex items-center gap-1 text-xs text-primary font-medium">
                <Pencil className="w-3 h-3" />
                {en ? 'Edit' : 'మార్చు'}
              </button>
            )}
          </div>

          {editingAddress ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {en ? 'Door / House Number' : 'తలుపు / ఇంటి నంబర్'} <span className="text-destructive">*</span>
                </label>
                <input value={doorNumber} onChange={e => setDoorNumber(e.target.value)}
                  placeholder={en ? 'Door No. 4-5, Yadav Street' : 'తలుపు నం. 4-5'}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {en ? 'Street / Landmark' : 'వీధి / లాండ్‌మార్క్'}
                </label>
                <input value={landmark} onChange={e => setLandmark(e.target.value)}
                  placeholder={en ? 'Near Hanuman Temple' : 'హనుమాన్ గుడి దగ్గర'}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {en ? 'Phone for Delivery' : 'డెలివరీ ఫోన్'}
                </label>
                <input value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value)}
                  placeholder="10-digit number" type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingAddress(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-1">
                  <X className="w-4 h-4" /> {en ? 'Cancel' : 'రద్దు'}
                </button>
                <button onClick={handleSaveAddress} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-70">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {en ? 'Save' : 'సేవ్'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {parsed.door ? (
                <>
                  <p className="text-sm text-foreground">{parsed.door}</p>
                  {parsed.landmark && <p className="text-sm text-muted-foreground">{parsed.landmark}</p>}
                  {(order as any).delivery_phone && (
                    <div className="flex items-center gap-1 mt-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{(order as any).delivery_phone}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {en ? 'No address added' : 'చిరునామా జోడించలేదు'}
                  {canEdit && (
                    <button onClick={handleEditStart} className="ml-2 text-primary font-medium">
                      {en ? '+ Add now' : '+ ఇప్పుడు జోడించు'}
                    </button>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-card rounded-2xl shadow-sm p-5">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
            {en ? 'Items' : 'వస్తువులు'}
          </p>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img src={item.item_image_url || FALLBACK} alt={item.item_name || 'Item'}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.item_name || 'Item'}</p>
                  <p className="text-xs text-muted-foreground">₹{item.unit_price} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">₹{item.total_price}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-foreground/5 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Subtotal' : 'ఉప మొత్తం'}</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{en ? 'Delivery Fee' : 'డెలివరీ రుసుము'}</span>
              <span className="text-primary font-medium">₹{order.delivery_fee}</span>
            </div>
            <div className="border-t border-dashed border-foreground/10 pt-2 flex justify-between items-center">
              <span className="font-semibold text-foreground">{en ? 'Total' : 'మొత్తం'}</span>
              <span className="text-xl font-bold text-foreground">₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}