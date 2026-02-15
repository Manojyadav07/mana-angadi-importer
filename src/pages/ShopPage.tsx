import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useShop } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useProducts';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedName, getLocalizedShopType } from '@/types';
import {
  ArrowLeft, Heart, Star, MapPin, BadgeCheck,
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

const CATEGORY_TABS_EN = ['Traditional Spices', 'Hand-Pounded Rice', 'Fresh Pulses', 'Local Oils'];
const CATEGORY_TABS_TE = ['సంప్రదాయ మసాలాలు', 'చేతి దంపుడు బియ్యం', 'తాజా పప్పులు', 'నాటు నూనెలు'];

export function ShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, addToCart, updateQuantity, getCartItemCount, getCartTotal } = useApp();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: shop, isLoading: shopLoading } = useShop(shopId);
  const { data: products = [], isLoading: productsLoading } = useProducts(shopId);

  const cartCount = getCartItemCount();
  const cartTotal = getCartTotal();
  const isLoading = shopLoading || productsLoading;

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.isActive);
  }, [products]);

  const getCartItem = (productId: string) =>
    cart.find(item => item.product.id === productId);

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
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!shop) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p className="text-muted-foreground font-display text-lg">{t.shopNotFound}</p>
        </div>
      </MobileLayout>
    );
  }

  const shopName = getLocalizedName(shop, language);
  const shopType = getLocalizedShopType(shop, language);
  const heroImg = SHOP_IMAGES[shop.type] || shopGroceryImg;
  const tabs = language === 'en' ? CATEGORY_TABS_EN : CATEGORY_TABS_TE;

  const tagline = language === 'en'
    ? `Serving Metlachittapur with authentic ${shopType.toLowerCase()} essentials since 1972.`
    : `1972 నుండి మెట్లచిట్టాపూర్‌కు అసలైన ${shopType} సేవలు.`;

  return (
    <MobileLayout>
      {/* ═══ 1. HERO SECTION ═══ */}
      <div className="relative w-full" style={{ height: 280 }}>
        <img
          src={heroImg}
          alt={shopName}
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.45) 100%)',
          }}
        />

        {/* Top navigation overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${isFavorited ? 'text-red-400 fill-red-400' : 'text-white'}`}
            />
          </button>
        </div>
      </div>

      {/* ═══ 2. SHOP INFO BLOCK (overlapping card) ═══ */}
      <div className="relative -mt-6 bg-background rounded-t-3xl px-6 pt-6 pb-4">
        <h1 className="font-display text-4xl font-semibold text-foreground leading-tight">
          {shopName}
        </h1>
        <p className="text-muted-foreground text-sm italic mt-2 leading-relaxed">
          {tagline}
        </p>

        {/* ═══ 3. STATS ROW ═══ */}
        <div className="flex items-center mt-5 py-4 border-y border-primary/10">
          {/* Rating */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-foreground font-semibold text-base">4.8</span>
            </div>
            <span className="label-micro">
              {language === 'en' ? 'RATING' : 'రేటింగ్'}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-primary/10" />

          {/* Distance */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-semibold text-base">1.2 km</span>
            </div>
            <span className="label-micro">
              {language === 'en' ? 'DISTANCE' : 'దూరం'}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-primary/10" />

          {/* Local Certified */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-primary" />
              <span className="text-foreground font-semibold text-base">
                {language === 'en' ? 'Local' : 'స్థానిక'}
              </span>
            </div>
            <span className="label-micro">
              {language === 'en' ? 'CERTIFIED' : 'ధ్రువీకరించబడింది'}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ 4. STICKY CATEGORY TABS ═══ */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-foreground/5">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide px-6 py-0">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`relative px-4 py-3.5 whitespace-nowrap text-sm font-medium transition-colors ${
                activeTab === idx
                  ? 'text-primary font-bold'
                  : 'text-foreground/40'
              }`}
            >
              {tab}
              {activeTab === idx && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ 5. PRODUCT SECTION ═══ */}
      <div className="px-5 pt-5 pb-36">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {tabs[activeTab]}
          </h2>
          <button className="text-primary text-sm font-medium">
            {language === 'en' ? 'View All' : 'అన్నీ చూడండి'}
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              {language === 'en' ? 'No products available yet' : 'ఇంకా ఉత్పత్తులు అందుబాటులో లేవు'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map(product => {
              const cartItem = getCartItem(product.id);
              const quantity = cartItem?.quantity || 0;
              const productName = getLocalizedName(product, language);
              const unit = language === 'en' ? product.unit_en : product.unit_te;

              return (
                <div
                  key={product.id}
                  className="bg-card rounded-xl shadow-sm border border-transparent hover:border-primary/20 transition-colors overflow-hidden flex"
                  style={{ minHeight: 120 }}
                >
                  {/* Product Image — Left 1/3 */}
                  <div className="w-1/3 flex-shrink-0 bg-muted">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={productName}
                        className={`w-full h-full object-cover ${!product.inStock ? 'opacity-50 grayscale' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[120px]">
                        <Package className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Product Info — Right 2/3 */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className={`text-lg font-medium leading-snug ${!product.inStock ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {productName}
                      </h3>
                      {product.category && (
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                          {product.category}
                        </p>
                      )}
                      {unit && (
                        <p className="text-muted-foreground text-xs italic mt-1">
                          {language === 'en' ? `per ${unit}` : `ప్రతి ${unit}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <span className={`text-lg font-bold ${!product.inStock ? 'text-muted-foreground' : 'text-foreground'}`}>
                        ₹{product.price}
                      </span>

                      {/* Add / Quantity */}
                      {!product.inStock ? (
                        <span className="text-destructive text-xs font-medium">{t.outOfStock}</span>
                      ) : quantity === 0 ? (
                        <button
                          onClick={() => addToCart(product)}
                          className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center active:scale-90 transition-transform"
                          >
                            <Minus className="w-4 h-4 text-foreground" />
                          </button>
                          <span className="w-5 text-center font-bold text-sm text-foreground">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ 7. FLOATING BASKET BAR ═══ */}
      {cartCount > 0 && (
        <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-30 animate-slide-up">
          <button
            onClick={() => navigate('/basket')}
            className="w-full bg-primary text-primary-foreground rounded-full px-6 py-4 flex items-center justify-between shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-medium text-base">
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
