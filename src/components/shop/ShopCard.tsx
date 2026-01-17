import { Shop, getLocalizedName, getLocalizedShopType } from '@/types';
import { Store, ChefHat, Pill, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ShopCardProps {
  shop: Shop;
  onClick?: () => void;
}

const shopIcons = {
  'కిరాణా': Store,
  'హోటల్': ChefHat,
  'మెడికల్': Pill,
};

export function ShopCard({ shop, onClick }: ShopCardProps) {
  const Icon = shopIcons[shop.type_te] || Store;
  const { t, language } = useLanguage();

  const shopName = getLocalizedName(shop, language);
  const shopType = getLocalizedShopType(shop, language);

  return (
    <div
      className={shop.isOpen ? 'shop-card-active' : 'shop-card-closed'}
      onClick={shop.isOpen ? onClick : undefined}
    >
      <div className="flex items-start gap-4">
        {/* Shop Icon */}
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-7 h-7 text-primary" />
        </div>

        {/* Shop Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {shopName}
          </h3>
          
          <p className="text-muted-foreground text-sm mt-0.5">
            {shopType}
          </p>

          {/* Trust Badge */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="trust-badge">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.trustBadge}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          {shop.isOpen ? (
            <span className="badge-open">
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse-soft" />
              {t.open}
            </span>
          ) : (
            <span className="badge-closed">
              {t.closed}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
