import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { getShops } from '@/data/mockData';
import { Shop, ShopType } from '@/types';
import { Store, Search, Plus, Edit2, MapPin, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function AdminShopsPage() {
  const { language } = useLanguage();
  const [shops, setShops] = useState<Shop[]>(getShops());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Shop>>({});

  const labels = {
    title: language === 'en' ? 'Shops' : 'షాప్స్',
    subtitle: language === 'en' ? 'Manage all shops' : 'అన్ని షాప్‌లను నిర్వహించండి',
    search: language === 'en' ? 'Search shops...' : 'షాప్‌లు వెతకండి...',
    addShop: language === 'en' ? 'Add Shop' : 'షాప్ జోడించు',
    editShop: language === 'en' ? 'Edit Shop' : 'షాప్ సవరించు',
    nameTe: language === 'en' ? 'Name (Telugu)' : 'పేరు (తెలుగు)',
    nameEn: language === 'en' ? 'Name (English)' : 'పేరు (ఆంగ్లం)',
    shopType: language === 'en' ? 'Shop Type' : 'షాప్ రకం',
    isOpen: language === 'en' ? 'Open Now' : 'ఇప్పుడు తెరిచి ఉంది',
    isActive: language === 'en' ? 'Active' : 'యాక్టివ్',
    pickupLocation: language === 'en' ? 'Pickup Location' : 'పికప్ లొకేషన్',
    save: language === 'en' ? 'Save' : 'సేవ్',
    cancel: language === 'en' ? 'Cancel' : 'రద్దు',
    noShops: language === 'en' ? 'No shops found' : 'షాప్‌లు కనుగొనబడలేదు',
    kirana: language === 'en' ? 'Grocery' : 'కిరాణా',
    restaurant: language === 'en' ? 'Restaurant' : 'హోటల్',
    medical: language === 'en' ? 'Medical' : 'మెడికల్',
  };

  const shopTypeOptions: { value: ShopType; label: string }[] = [
    { value: 'kirana', label: labels.kirana },
    { value: 'restaurant', label: labels.restaurant },
    { value: 'medical', label: labels.medical },
  ];

  const filteredShops = shops.filter(shop => 
    shop.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.name_te.includes(searchQuery)
  );

  const handleEdit = (shop: Shop) => {
    setSelectedShop(shop);
    setEditData({ ...shop });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedShop || !editData) return;
    
    setShops(prev => prev.map(s => 
      s.id === selectedShop.id ? { ...s, ...editData } as Shop : s
    ));
    setIsEditing(false);
    setSelectedShop(null);
    setEditData({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedShop(null);
    setEditData({});
  };

  const getShopTypeEmoji = (type: ShopType) => {
    switch (type) {
      case 'kirana': return '🛒';
      case 'restaurant': return '🍽️';
      case 'medical': return '💊';
      default: return '🏪';
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="screen-header">
        <div className="flex-1">
          <h1 className="font-bold text-xl text-foreground">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={labels.search}
            className="pl-10"
          />
        </div>

        {/* Shop List */}
        {filteredShops.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{labels.noShops}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                      {getShopTypeEmoji(shop.type)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {language === 'en' ? shop.name_en : shop.name_te}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' ? shop.type_en : shop.type_te}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${shop.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-muted-foreground">
                          {shop.isOpen 
                            ? (language === 'en' ? 'Open' : 'తెరిచి ఉంది')
                            : (language === 'en' ? 'Closed' : 'మూసి ఉంది')
                          }
                        </span>
                        {!shop.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                            {language === 'en' ? 'Inactive' : 'నిష్క్రియ'}
                          </span>
                        )}
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
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
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
      {isEditing && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-foreground">{labels.editShop}</h3>
                <button onClick={handleCancel} className="p-2 rounded-full hover:bg-muted">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Name Telugu */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{labels.nameTe}</label>
                <Input
                  value={editData.name_te || ''}
                  onChange={(e) => setEditData({ ...editData, name_te: e.target.value })}
                />
              </div>

              {/* Name English */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{labels.nameEn}</label>
                <Input
                  value={editData.name_en || ''}
                  onChange={(e) => setEditData({ ...editData, name_en: e.target.value })}
                />
              </div>

              {/* Shop Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{labels.shopType}</label>
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
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        editData.type === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-foreground">{labels.isOpen}</span>
                  <Switch
                    checked={editData.isOpen}
                    onCheckedChange={(checked) => setEditData({ ...editData, isOpen: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-foreground">{labels.isActive}</span>
                  <Switch
                    checked={editData.isActive}
                    onCheckedChange={(checked) => setEditData({ ...editData, isActive: checked })}
                  />
                </div>
              </div>

              {/* Pickup Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{labels.pickupLocation}</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={editData.pickupLat || ''}
                    onChange={(e) => setEditData({ ...editData, pickupLat: parseFloat(e.target.value) })}
                  />
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={editData.pickupLng || ''}
                    onChange={(e) => setEditData({ ...editData, pickupLng: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium"
                >
                  {labels.cancel}
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {labels.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
}
