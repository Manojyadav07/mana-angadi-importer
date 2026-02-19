import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useShop } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedName, getLocalizedShopType } from '@/types';
import {
  ArrowLeft, Search, Star, MapPin,
  Plus, Minus, Loader2, Package, ShoppingBag,
} from 'lucide-react';

import shopGroceryImg from '@/assets/shop-grocery-1.jpg';
import shopFoodImg from '@/assets/shop-food-1.jpg';
import shopMedicalImg from '@/assets/shop-medical-1.jpg';

const SHOP_IMAGES: Record<string, string> = {
  kirana: shopGroceryImg,
  restaurant: shopFoodImg,
  medical: shopMedicalImg,
};

const TABS_EN = ['All', 'Popular', 'Recommended'];
const TABS_TE = ['అన్నీ', 'ప్రసిద్ధ', 'సిఫార్సు'];

export function ShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, addToCart, updateQuantity, getCartItemCount, getCartTotal } = useCart();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: shop, isLoading: shopLoading } = useShop(shopId);
  const { data: products = [], isLoading: productsLoading } = useProducts(shopId);

  const cartCount = getCartItemCount();
  const cartTotal = getCartTotal();
  const isLoading = shopLoading || productsLoading;

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.isActive);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name_en.toLowerCase().includes(q) || p.name_te.includes(q)
      );
    }
    return filtered;
  }, [products, searchQuery]);

  const getCartItem = (productId: string) =>
    cart.find(item => item.product_id === productId);

  const handleBack = () => {
    const fromCategory = searchParams.get('from');
    if (fromCategory) {
      navigate(`/shops?category=${fromCategory}`);
    } else {
      navigate(-1);
    }
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

  if (!shop) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground font-display text-lg">{t.shopNotFound}</p>
        </div>
      </MobileLayout>
    );
  }

  const shopName = getLocalizedName(shop, language);
  const shopType = getLocalizedShopType(shop, language);
  const heroImg = SHOP_IMAGES[shop.type] || shopGroceryImg;
  const tabs = language === 'en' ? TABS_EN : TABS_TE;

  return (
    <MobileLayout>
      {/* ═══ 1. STICKY HEADER ═══ */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display text-lg font-semibold text-foreground truncate mx-3 flex-1 text-center">
            {shopName}
          </h1>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
          >
            <Search className="w-5 h-5 text-foreground" />
          </button>
        </div>
        {showSearch && (
          <div className="px-4 pb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search products...' : 'ఉత్పత్తులు వెతకండి...'}
              className="w-full px-4 py-2.5 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>
        )}
      </header>

      {/* ═══ 2. HERO SECTION ═══ */}
      <div className="px-4 pt-4">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted shadow-sm">
          <img src={heroImg} alt={shopName} className="w-full h-full object-cover" />
          {shop.isOpen && (
            <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-primary text-xs font-semibold">
                {language === 'en' ? 'Open Now' : 'ఇప్పుడు తెరిచి ఉంది'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ 3. SHOP INFO BLOCK ═══ */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="font-display text-2xl font-semibold text-foreground">{shopName}</h2>
        <p className="text-muted-foreground text-sm italic mt-1">{shopType}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-foreground">4.8</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">1.2 km</span>
          </div>
        </div>
        <div className="h-px bg-border mt-4" />
      </div>

      {/* ═══ 4. CATEGORY TABS ═══ */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === idx
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ 5. PRODUCT LIST ═══ */}
      <div className="px-4 pb-36 space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {language === 'en' ? 'No products available' : 'ఉత్పత్తులు అందుబాటులో లేవు'}
            </p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const cartItem = getCartItem(product.id);
            const quantity = cartItem?.quantity || 0;
            const productName = getLocalizedName(product, language);
            const unit = language === 'en' ? product.unit_en : product.unit_te;

            return (
              <div
                key={product.id}
                className="bg-card rounded-xl shadow-sm p-4 flex items-center gap-4"
              >
                {/* Square Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={productName}
                      className={`w-full h-full object-cover ${!product.inStock ? 'opacity-50 grayscale' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm leading-tight ${!product.inStock ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {productName}
                  </h4>
                  {unit && (
                    <p className="text-muted-foreground text-xs mt-0.5">{unit}</p>
                  )}
                  <p className="text-foreground font-semibold text-sm mt-1">₹{product.price}</p>
                  {!product.inStock && (
                    <span className="text-destructive text-xs">{t.outOfStock}</span>
                  )}
                </div>

                {/* Add / Quantity Stepper */}
                <div className="flex-shrink-0">
                  {!product.inStock ? (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center opacity-40">
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ) : quantity === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-primary/10 rounded-full h-10 px-1">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Minus className="w-4 h-4 text-foreground" />
                      </button>
                      <span className="w-7 text-center font-bold text-sm text-foreground">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ═══ 6. FLOATING BASKET BAR ═══ */}
      {cartCount > 0 && (
        <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-30 animate-slide-up">
          <button
            onClick={() => navigate('/basket')}
            className="w-full bg-primary text-primary-foreground rounded-full px-5 py-3.5 flex items-center justify-between shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-medium">
                {cartCount} {cartCount === 1 ? (language === 'en' ? 'item' : 'వస్తువు') : (language === 'en' ? 'items' : 'వస్తువులు')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">₹{cartTotal}</span>
              <span className="text-sm opacity-70">
                {language === 'en' ? 'View Basket' : 'బుట్ట చూడండి'} ›
              </span>
            </div>
          </button>
        </div>
      )}
    </MobileLayout>
  );
}
