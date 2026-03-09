import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useShops, useUpdateShop } from '@/hooks/useShops';
import { Shop, ShopType } from '@/types';
import { Store, Search, Edit2, MapPin, Check, X, Loader2, RefreshCw, Power } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export function AdminShopsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';
  const { data: shops = [], isLoading, refetch } = useShops();
  const updateShop = useUpdateShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [editData, setEditData] = useState<Partial<Shop>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const shopTypeOptions: { value: ShopType; label: string; emoji: string }[] = [
    { value: 'kirana', label: en ? 'Grocery' : 'కిరాణా', emoji: '🛒' },
    { value: 'restaurant', label: en ? 'Restaurant' : 'హోటల్', emoji: '🍽️' },
    { value: 'medical', label: en ? 'Medical' : 'మెడికల్', emoji: '💊' },
  ];

  const getShopTypeEmoji = (type: string) => {
    const found = shopTypeOptions.find(o => o.value === type);
    return found?.emoji ?? '🏪';
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch =
      shop.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.name_te.includes(searchQuery);
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && shop.isActive) ||
      (filterStatus === 'inactive' && !shop.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (shop: Shop) => {
    setSelectedShop(shop);
    setEditData({ ...shop });
  };

  const handleSave = async () => {
    if (!selectedShop) return;
    try {
      await updateShop.mutateAsync({ id: selectedShop.id, updates: editData });
      toast.success(en ? 'Shop updated ✅' : 'షాప్ అప్‌డేట్ అయింది ✅');
      setSelectedShop(null);
      setEditData({});
    } catch (err: any) {
      toast.error(err.message || (en ? 'Failed to update' : 'అప్‌డేట్ విఫలమైంది'));
    }
  };

  const handleQuickToggle = async (shop: Shop, field: 'isOpen' | 'isActive') => {
    try {
      await updateShop.mutateAsync({
        id: shop.id,
        updates: { [field]: !shop[field] },
      });
      toast.success(
        field === 'isOpen'
          ? (shop.isOpen ? (en ? 'Shop closed' : 'షాప్ మూసివేయబడింది') : (en ? 'Shop opened' : 'షాప్ తెరవబడింది'))
          : (shop.isActive ? (en ? 'Shop deactivated' : 'షాప్ నిష్క్రియం చేయబడింది') : (en ? 'Shop activated' : 'షాప్ యాక్టివ్ చేయబడింది'))
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Stats
  const activeCount = shops.filter(s => s.isActive).length;
  const openCount = shops.filter(s => s.isOpen && s.isActive).length;
  const inactiveCount = shops.filter(s => !s.isActive).length;

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
              {en ? 'Shops' : 'షాప్స్'}
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

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: en ? 'Total' : 'మొత్తం', value: shops.length, color: 'text-foreground' },
            { label: en ? 'Open' : 'తెరిచి', value: openCount, color: 'text-green-600' },
            { label: en ? 'Inactive' : 'నిష్క్రియ', value: inactiveCount, color: 'text-red-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-xl shadow-sm p-3 text-center">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={en ? 'Search shops...' : 'షాప్‌లు వెతకండి...'}
            className="pl-9 rounded-xl"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterStatus === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {f === 'all' ? (en ? 'All' : 'అన్నీ') :
               f === 'active' ? (en ? 'Active' : 'యాక్టివ్') :
               (en ? 'Inactive' : 'నిష్క్రియ')}
            </button>
          ))}
        </div>

        {/* Shop List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              {en ? 'No shops found' : 'షాప్‌లు కనుగొనబడలేదు'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShops.map((shop) => (
              <div key={shop.id} className="bg-card rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                      {getShopTypeEmoji(shop.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {en ? shop.name_en : shop.name_te}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{shop.type}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {/* Open/Closed quick toggle */}
                        <button
                          onClick={() => handleQuickToggle(shop, 'isOpen')}
                          disabled={updateShop.isPending}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${
                            shop.isOpen
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {shop.isOpen ? (en ? 'Open' : 'తెరిచి') : (en ? 'Closed' : 'మూసి')}
                        </button>
                        {/* Active/Inactive quick toggle */}
                        <button
                          onClick={() => handleQuickToggle(shop, 'isActive')}
                          disabled={updateShop.isPending}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${
                            shop.isActive
                              ? 'bg-primary/10 text-primary'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {shop.isActive ? (en ? 'Active' : 'యాక్టివ్') : (en ? 'Inactive' : 'నిష్క్రియ')}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(shop)}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {shop.pickupLat && shop.pickupLng && (
                  <div className="mt-3 pt-3 border-t border-foreground/5 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{shop.pickupLat.toFixed(4)}, {shop.pickupLng.toFixed(4)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Sheet */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/5">
              <h3 className="font-semibold text-lg text-foreground">
                {en ? 'Edit Shop' : 'షాప్ సవరించు'}
              </h3>
              <button
                onClick={() => { setSelectedShop(null); setEditData({}); }}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
              {/* Name Telugu */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Name (Telugu)' : 'పేరు (తెలుగు)'}
                </label>
                <Input
                  value={editData.name_te || ''}
                  onChange={(e) => setEditData({ ...editData, name_te: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              {/* Name English */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Name (English)' : 'పేరు (ఆంగ్లం)'}
                </label>
                <Input
                  value={editData.name_en || ''}
                  onChange={(e) => setEditData({ ...editData, name_en: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              {/* Shop Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Shop Type' : 'షాప్ రకం'}
                </label>
                <div className="flex gap-2">
                  {shopTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEditData({
                        ...editData,
                        type: opt.value,
                        type_te: opt.value === 'kirana' ? 'కిరాణా' : opt.value === 'restaurant' ? 'హోటల్' : 'మెడికల్',
                        type_en: opt.value === 'kirana' ? 'Grocery' : opt.value === 'restaurant' ? 'Restaurant' : 'Medical',
                      })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        editData.type === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                {[
                  { label: en ? 'Open Now' : 'ఇప్పుడు తెరిచి ఉంది', field: 'isOpen' as const },
                  { label: en ? 'Active' : 'యాక్టివ్', field: 'isActive' as const },
                ].map(({ label, field }) => (
                  <div key={field} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Power className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{label}</span>
                    </div>
                    <Switch
                      checked={!!editData[field]}
                      onCheckedChange={(checked) => setEditData({ ...editData, [field]: checked })}
                    />
                  </div>
                ))}
              </div>

              {/* Pickup Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'Pickup Location (GPS)' : 'పికప్ లొకేషన్ (GPS)'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={editData.pickupLat || ''}
                    onChange={(e) => setEditData({ ...editData, pickupLat: parseFloat(e.target.value) })}
                    className="rounded-xl"
                  />
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={editData.pickupLng || ''}
                    onChange={(e) => setEditData({ ...editData, pickupLng: parseFloat(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* UPI Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {en ? 'UPI ID' : 'UPI ID'}
                </label>
                <Input
                  value={editData.upiVpa || ''}
                  onChange={(e) => setEditData({ ...editData, upiVpa: e.target.value })}
                  placeholder="merchant@upi"
                  className="rounded-xl"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-4">
                <button
                  onClick={() => { setSelectedShop(null); setEditData({}); }}
                  className="flex-1 py-3 rounded-xl border border-foreground/10 text-foreground font-medium text-sm"
                >
                  {en ? 'Cancel' : 'రద్దు'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateShop.isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updateShop.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {en ? 'Save Changes' : 'మార్పులు సేవ్ చేయండి'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






