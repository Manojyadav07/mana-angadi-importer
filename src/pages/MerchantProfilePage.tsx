import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getShopsByOwner, updateShopOpenStatus } from '@/data/mockData';
import { Switch } from '@/components/ui/switch';
import { Store, LogOut, Settings } from 'lucide-react';
import { getShopTypeIcon, getLocalizedName, getLocalizedShopType } from '@/types';
import { useState } from 'react';

export function MerchantProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const [, forceUpdate] = useState({});
  
  const shops = user?.shopIds ? getShopsByOwner(user.id) : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleShopToggle = (shopId: string, isOpen: boolean) => {
    updateShopOpenStatus(shopId, isOpen);
    forceUpdate({});
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t.navProfile}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t.merchantMode}
            </p>
          </div>
          
          {/* Language Toggle */}
          <div className="flex items-center bg-muted rounded-full p-0.5">
            <button
              onClick={() => setLanguage('te')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                language === 'te'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 pb-4 space-y-4">
        {/* Merchant Details */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.name || t.noName}</p>
              <p className="text-muted-foreground text-sm">{user?.phone}</p>
            </div>
          </div>
        </div>

        {/* My Shops */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            {t.myShops}
          </h3>
          
          <div className="space-y-4">
            {shops.map(shop => (
              <div key={shop.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getShopTypeIcon(shop.type)}</span>
                  <div>
                    <p className="font-medium text-foreground">
                      {getLocalizedName(shop, language)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getLocalizedShopType(shop, language)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Switch
                    checked={shop.isOpen}
                    onCheckedChange={(checked) => handleShopToggle(shop.id, checked)}
                  />
                  <span className={`text-xs ${shop.isOpen ? 'text-primary' : 'text-muted-foreground'}`}>
                    {shop.isOpen ? t.open : t.closed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-destructive/10 text-destructive font-medium active:scale-[0.98] transition-transform"
        >
          <LogOut className="w-5 h-5" />
          {t.logout}
        </button>
      </div>
    </MobileLayout>
  );
}
