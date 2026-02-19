import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { DeliveryFeeRule, DEFAULT_DELIVERY_FEE_RULES } from '@/types';
import { DollarSign, Edit2, Check, X, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function AdminFeesPage() {
  const { language } = useLanguage();
  const [feeRules, setFeeRules] = useState<DeliveryFeeRule[]>([DEFAULT_DELIVERY_FEE_RULES]);
  const [editingRule, setEditingRule] = useState<DeliveryFeeRule | null>(null);
  const [editData, setEditData] = useState<Partial<DeliveryFeeRule>>({});

  const labels = {
    title: language === 'en' ? 'Delivery Fees' : 'డెలివరీ ఫీస్',
    subtitle: language === 'en' ? 'Manage fee rules' : 'ఫీ నియమాలు నిర్వహించండి',
    baseFees: language === 'en' ? 'Base Fees by Shop Type' : 'షాప్ రకం ప్రకారం బేస్ ఫీస్',
    kirana: language === 'en' ? 'Grocery' : 'కిరాణా',
    restaurant: language === 'en' ? 'Restaurant' : 'హోటల్',
    medical: language === 'en' ? 'Medical' : 'మెడికల్',
    distanceFee: language === 'en' ? 'Per KM Fee' : 'కి.మీ కి ఫీ',
    freeDeliveryThreshold: language === 'en' ? 'Free Delivery Above' : 'ఉచిత డెలివరీ పై',
    maxCap: language === 'en' ? 'Maximum Fee Cap' : 'గరిష్ట ఫీ పరిమితి',
    minOrderRestaurant: language === 'en' ? 'Min Order (Restaurant)' : 'కనిష్ట ఆర్డర్ (హోటల్)',
    isActive: language === 'en' ? 'Active' : 'యాక్టివ్',
    village: language === 'en' ? 'Village' : 'గ్రామం',
    edit: language === 'en' ? 'Edit' : 'సవరించు',
    save: language === 'en' ? 'Save' : 'సేవ్',
    cancel: language === 'en' ? 'Cancel' : 'రద్దు',
    default: language === 'en' ? 'Default' : 'డిఫాల్ట్',
    feeInfo: language === 'en' 
      ? 'Total fee = Base fee + (Distance × Per KM fee), capped at maximum'
      : 'మొత్తం ఫీ = బేస్ ఫీ + (దూరం × కి.మీ ఫీ), గరిష్టంలో పరిమితం',
  };

  const handleEdit = (rule: DeliveryFeeRule) => {
    setEditingRule(rule);
    setEditData({ ...rule });
  };

  const handleSave = () => {
    if (!editingRule || !editData) return;
    
    setFeeRules(prev => prev.map(r => 
      r.id === editingRule.id ? { ...r, ...editData } as DeliveryFeeRule : r
    ));
    setEditingRule(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingRule(null);
    setEditData({});
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="screen-header">
        <div>
          <h1 className="font-bold text-xl text-foreground">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-primary/10 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary">{labels.feeInfo}</p>
        </div>

        {/* Fee Rules */}
        {feeRules.map((rule) => (
          <div key={rule.id} className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {rule.villageKey || labels.default}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    rule.isActive 
                      ? 'bg-green-500/10 text-green-600' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {rule.isActive ? labels.isActive : 'Inactive'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEdit(rule)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Base Fees */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{labels.baseFees}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <p className="text-lg font-bold text-foreground">₹{rule.baseFeeKirana}</p>
                    <p className="text-xs text-muted-foreground">{labels.kirana}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <p className="text-lg font-bold text-foreground">₹{rule.baseFeeRestaurant}</p>
                    <p className="text-xs text-muted-foreground">{labels.restaurant}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <p className="text-lg font-bold text-foreground">₹{rule.baseFeeMedical}</p>
                    <p className="text-xs text-muted-foreground">{labels.medical}</p>
                  </div>
                </div>
              </div>

              {/* Other Rules */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">{labels.distanceFee}</p>
                  <p className="font-semibold text-foreground">₹{rule.perKmFee || 0}/km</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">{labels.maxCap}</p>
                  <p className="font-semibold text-foreground">₹{rule.maxFeeCap || '∞'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">{labels.freeDeliveryThreshold}</p>
                  <p className="font-semibold text-foreground">₹{rule.freeDeliveryMinOrder || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">{labels.minOrderRestaurant}</p>
                  <p className="font-semibold text-foreground">₹{rule.minOrderRestaurant || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Sheet */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-foreground">{labels.edit}</h3>
                <button onClick={handleCancel} className="p-2 rounded-full hover:bg-muted">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Base Fees */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">{labels.baseFees}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{labels.kirana}</label>
                    <Input
                      type="number"
                      value={editData.baseFeeKirana || ''}
                      onChange={(e) => setEditData({ ...editData, baseFeeKirana: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{labels.restaurant}</label>
                    <Input
                      type="number"
                      value={editData.baseFeeRestaurant || ''}
                      onChange={(e) => setEditData({ ...editData, baseFeeRestaurant: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{labels.medical}</label>
                    <Input
                      type="number"
                      value={editData.baseFeeMedical || ''}
                      onChange={(e) => setEditData({ ...editData, baseFeeMedical: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Per KM Fee */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{labels.distanceFee}</label>
                <Input
                  type="number"
                  value={editData.perKmFee || ''}
                  onChange={(e) => setEditData({ ...editData, perKmFee: parseInt(e.target.value) })}
                />
              </div>

              {/* Free Delivery Threshold */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{labels.freeDeliveryThreshold}</label>
                <Input
                  type="number"
                  value={editData.freeDeliveryMinOrder || ''}
                  onChange={(e) => setEditData({ ...editData, freeDeliveryMinOrder: parseInt(e.target.value) })}
                />
              </div>

              {/* Max Cap */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{labels.maxCap}</label>
                <Input
                  type="number"
                  value={editData.maxFeeCap || ''}
                  onChange={(e) => setEditData({ ...editData, maxFeeCap: parseInt(e.target.value) })}
                />
              </div>

              {/* Min Order Restaurant */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{labels.minOrderRestaurant}</label>
                <Input
                  type="number"
                  value={editData.minOrderRestaurant || ''}
                  onChange={(e) => setEditData({ ...editData, minOrderRestaurant: parseInt(e.target.value) })}
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-sm text-foreground">{labels.isActive}</span>
                <Switch
                  checked={editData.isActive}
                  onCheckedChange={(checked) => setEditData({ ...editData, isActive: checked })}
                />
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
