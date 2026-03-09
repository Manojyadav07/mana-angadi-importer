import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useShops, useUpdateShop } from '@/hooks/useShops';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Store, Search, Power, Eye, Loader2,
  RefreshCw, ChevronRight, Package, X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MerchantProfile {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  roles: string[];
}

function useMerchants() {
  return useQuery({
    queryKey: ['admin-merchants'],
    queryFn: async (): Promise<MerchantProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, phone, roles')
        .contains('roles', ['merchant']);
      if (error) throw error;
      return data || [];
    },
  });
}

export function AdminMerchantsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';
  const { data: merchants = [], isLoading: merchantsLoading, refetch: refetchMerchants } = useMerchants();
  const { data: shops = [], isLoading: shopsLoading, refetch: refetchShops } = useShops();
  const updateShop = useUpdateShop();

  const [search, setSearch] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantProfile | null>(null);

  const isLoading = merchantsLoading || shopsLoading;

  const getMerchantShop = (userId: string) =>
    shops.find(s => s.ownerId === userId);

  const filteredMerchants = merchants.filter(m => {
    const name = (m.display_name || '').toLowerCase();
    const phone = (m.phone || '');
    return name.includes(search.toLowerCase()) || phone.includes(search);
  });

  const handleToggleShop = async (userId: string, field: 'isActive' | 'isOpen') => {
    const shop = getMerchantShop(userId);
    if (!shop) {
      toast.error(en ? 'No shop found for this merchant' : 'ఈ వ్యాపారికి షాప్ కనుగొనబడలేదు');
      return;
    }
    try {
      await updateShop.mutateAsync({ id: shop.id, updates: { [field]: !shop[field] } });
      toast.success(
        field === 'isActive'
          ? (shop.isActive
              ? (en ? 'Shop suspended' : 'షాప్ నిలిపివేయబడింది')
              : (en ? 'Shop activated' : 'షాప్ యాక్టివ్ చేయబడింది'))
          : (shop.isOpen
              ? (en ? 'Shop closed' : 'షాప్ మూసివేయబడింది')
              : (en ? 'Shop opened' : 'షాప్ తెరవబడింది'))
      );
      refetchShops();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Stats
  const activeCount = merchants.filter(m => getMerchantShop(m.user_id)?.isActive).length;
  const suspendedCount = merchants.filter(m => {
    const shop = getMerchantShop(m.user_id);
    return shop && !shop.isActive;
  }).length;
  const noShopCount = merchants.filter(m => !getMerchantShop(m.user_id)).length;

  const selectedShop = selectedMerchant ? getMerchantShop(selectedMerchant.user_id) : null;

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
              {en ? 'Merchants' : 'వ్యాపారులు'}
            </h1>
          </div>
          <button onClick={() => { refetchMerchants(); refetchShops(); }}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: en ? 'Total' : 'మొత్తం', value: merchants.length, color: 'text-foreground' },
            { label: en ? 'Active' : 'యాక్టివ్', value: activeCount, color: 'text-green-600' },
            { label: en ? 'Suspended' : 'నిలిపివేసిన', value: suspendedCount, color: 'text-red-600' },
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
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={en ? 'Search merchant...' : 'వ్యాపారి వెతకండి...'}
            className="pl-9 rounded-xl"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="text-center py-16">
            <Store className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {en ? 'No merchants found' : 'వ్యాపారులు కనుగొనబడలేదు'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMerchants.map((merchant) => {
              const shop = getMerchantShop(merchant.user_id);
              return (
                <div key={merchant.user_id} className="bg-card rounded-2xl shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {merchant.display_name || (en ? 'Unknown' : 'తెలియదు')}
                        </p>
                        <p className="text-xs text-muted-foreground">{merchant.phone || '—'}</p>
                        {shop ? (
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              🏪 {en ? shop.name_en : shop.name_te}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              shop.isActive
                                ? 'bg-green-500/10 text-green-600'
                                : 'bg-red-500/10 text-red-600'
                            }`}>
                              {shop.isActive
                                ? (en ? 'Active' : 'యాక్టివ్')
                                : (en ? 'Suspended' : 'నిలిపివేసిన')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              shop.isOpen
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {shop.isOpen ? (en ? 'Open' : 'తెరిచి') : (en ? 'Closed' : 'మూసి')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 mt-1 block">
                            ⚠️ {en ? 'No shop created yet' : 'షాప్ ఇంకా సృష్టించలేదు'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMerchant(merchant)}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      {selectedMerchant && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/5">
              <h3 className="font-semibold text-lg text-foreground">
                {selectedMerchant.display_name || (en ? 'Merchant' : 'వ్యాపారి')}
              </h3>
              <button onClick={() => setSelectedMerchant(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-4">
              {/* Merchant Info */}
              <div className="bg-muted/40 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{en ? 'Phone' : 'ఫోన్'}</span>
                  <span className="text-sm font-medium text-foreground">{selectedMerchant.phone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{en ? 'User ID' : 'యూజర్ ID'}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {selectedMerchant.user_id.slice(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Shop Info */}
              {selectedShop ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {en ? 'Shop Details' : 'షాప్ వివరాలు'}
                  </p>
                  <div className="bg-muted/40 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">{en ? 'Shop Name' : 'షాప్ పేరు'}</span>
                      <span className="text-sm font-medium text-foreground">
                        {en ? selectedShop.name_en : selectedShop.name_te}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">{en ? 'Type' : 'రకం'}</span>
                      <span className="text-sm font-medium text-foreground capitalize">{selectedShop.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">{en ? 'Status' : 'స్థితి'}</span>
                      <span className={`text-sm font-semibold ${
                        selectedShop.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedShop.isActive ? (en ? 'Active' : 'యాక్టివ్') : (en ? 'Suspended' : 'నిలిపివేసిన')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">{en ? 'Open Now' : 'ఇప్పుడు తెరిచి'}</span>
                      <span className={`text-sm font-semibold ${
                        selectedShop.isOpen ? 'text-blue-600' : 'text-muted-foreground'
                      }`}>
                        {selectedShop.isOpen ? (en ? 'Yes' : 'అవును') : (en ? 'No' : 'లేదు')}
                      </span>
                    </div>
                    {selectedShop.upiVpa && (
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">UPI</span>
                        <span className="text-sm font-mono text-foreground">{selectedShop.upiVpa}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleToggleShop(selectedMerchant.user_id, 'isOpen')}
                      disabled={updateShop.isPending}
                      className={`py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                        selectedShop.isOpen
                          ? 'bg-muted text-foreground'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      {selectedShop.isOpen
                        ? (en ? 'Close Shop' : 'షాప్ మూయండి')
                        : (en ? 'Open Shop' : 'షాప్ తెరవండి')}
                    </button>
                    <button
                      onClick={() => handleToggleShop(selectedMerchant.user_id, 'isActive')}
                      disabled={updateShop.isPending}
                      className={`py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                        selectedShop.isActive
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-green-500/10 text-green-600'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      {selectedShop.isActive
                        ? (en ? 'Suspend' : 'నిలిపివేయండి')
                        : (en ? 'Activate' : 'యాక్టివ్ చేయండి')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 rounded-2xl p-4 flex items-center gap-3">
                  <Package className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-700">
                    {en
                      ? 'This merchant has not created their shop yet.'
                      : 'ఈ వ్యాపారి ఇంకా తమ షాప్‌ను సృష్టించలేదు.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






