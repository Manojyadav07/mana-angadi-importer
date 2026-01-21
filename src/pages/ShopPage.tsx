import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductRow } from '@/components/shop/ProductRow';
import { useShop } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useProducts';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedName, getLocalizedShopType } from '@/types';
import { ArrowLeft, ShoppingBag, Store, ChefHat, Pill, Loader2 } from 'lucide-react';

const shopIcons = {
  'కిరాణా': Store,
  'హోటల్': ChefHat,
  'మెడికల్': Pill,
};

export function ShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity } = useApp();
  const { getCartItemCount, getCartTotal } = useApp();
  const { t, language } = useLanguage();

  // Fetch shop and products from database
  const { data: shop, isLoading: shopLoading } = useShop(shopId);
  const { data: products = [], isLoading: productsLoading } = useProducts(shopId);

  const cartCount = getCartItemCount();
  const cartTotal = getCartTotal();
  const isLoading = shopLoading || productsLoading;

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!shop) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">
            {t.shopNotFound}
          </p>
        </div>
      </MobileLayout>
    );
  }

  const Icon = shopIcons[shop.type_te] || Store;
  const shopName = getLocalizedName(shop, language);
  const shopType = getLocalizedShopType(shop, language);

  const getCartItem = (productId: string) => {
    return cart.find(item => item.product.id === productId);
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="screen-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg text-foreground truncate">
                {shopName}
              </h1>
              <p className="text-muted-foreground text-sm">{shopType}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Products List */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {products.map(product => (
            <ProductRow
              key={product.id}
              product={product}
              cartItem={getCartItem(product.id)}
              onAdd={() => addToCart(product)}
              onIncrease={() => {
                const item = getCartItem(product.id);
                if (item) {
                  updateQuantity(product.id, item.quantity + 1);
                }
              }}
              onDecrease={() => {
                const item = getCartItem(product.id);
                if (item) {
                  updateQuantity(product.id, item.quantity - 1);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto animate-slide-up">
          <button
            onClick={() => navigate('/cart')}
            className="w-full btn-accent flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-foreground/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span>{cartCount} {t.items}</span>
            </div>
            <span className="font-bold">₹{cartTotal}</span>
          </button>
        </div>
      )}
    </MobileLayout>
  );
}
