import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { getShopsByOwner, getProductsByShopId, updateProduct, addProduct } from '@/data/mockData';
import { Package, Plus, ImageIcon } from 'lucide-react';
import { Product, getLocalizedName, Shop } from '@/types';
import { Switch } from '@/components/ui/switch';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';

export function MerchantProductsPage() {
  const { user } = useApp();
  const { t, language } = useLanguage();
  const [isLoading] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [, forceUpdate] = useState({});
  
  const shops = user?.shopIds ? getShopsByOwner(user.id) : [];
  
  // Form state
  const [formData, setFormData] = useState({
    name_te: '',
    name_en: '',
    price: '',
    inStock: true,
    isActive: true,
    category: '',
  });

  const resetForm = () => {
    setFormData({
      name_te: '',
      name_en: '',
      price: '',
      inStock: true,
      isActive: true,
      category: '',
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_te: product.name_te,
      name_en: product.name_en,
      price: product.price.toString(),
      inStock: product.inStock,
      isActive: product.isActive,
      category: product.category || '',
    });
    setShowAddSheet(true);
  };

  const handleAddNew = (shop: Shop) => {
    setSelectedShop(shop);
    setEditingProduct(null);
    resetForm();
    setShowAddSheet(true);
  };

  const handleSave = () => {
    if (!formData.name_te || !formData.name_en || !formData.price) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లను పూరించండి');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error(language === 'en' ? 'Please enter a valid price' : 'దయచేసి సరైన ధర నమోదు చేయండి');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.shopId, editingProduct.id, {
        name_te: formData.name_te,
        name_en: formData.name_en,
        price,
        inStock: formData.inStock,
        isActive: formData.isActive,
        category: formData.category,
      });
    } else if (selectedShop) {
      const newProduct: Product = {
        id: `p_${Date.now()}`,
        shopId: selectedShop.id,
        name_te: formData.name_te,
        name_en: formData.name_en,
        price,
        inStock: formData.inStock,
        isActive: formData.isActive,
        category: formData.category,
      };
      addProduct(selectedShop.id, newProduct);
    }

    toast.success(t.productSaved);
    setShowAddSheet(false);
    forceUpdate({});
  };

  const handleToggleStock = (shopId: string, productId: string, inStock: boolean) => {
    updateProduct(shopId, productId, { inStock });
    forceUpdate({});
  };

  const handleToggleActive = (shopId: string, productId: string, isActive: boolean) => {
    updateProduct(shopId, productId, { isActive });
    forceUpdate({});
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground animate-fade-in">
          {t.myProducts}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm animate-fade-in" style={{ animationDelay: '0.05s' }}>
          {t.merchantMode}
        </p>
      </header>

      {isLoading ? (
        <div className="px-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-6">
          {shops.map(shop => {
            const products = getProductsByShopId(shop.id);
            
            return (
              <div key={shop.id} className="animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-foreground">
                    {getLocalizedName(shop, language)}
                  </h2>
                  <button
                    onClick={() => handleAddNew(shop)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addProduct}
                  </button>
                </div>
                
                {products.length === 0 ? (
                  <div className="bg-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">{t.noProducts}</p>
                    <button
                      onClick={() => handleAddNew(shop)}
                      className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium"
                    >
                      {t.addProduct}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {products.map(product => (
                      <div
                        key={product.id}
                        className="bg-card rounded-xl border border-border p-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          {/* Product Image */}
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p 
                              className="font-medium text-foreground truncate cursor-pointer"
                              onClick={() => handleEditProduct(product)}
                            >
                              {getLocalizedName(product, language)}
                            </p>
                            <p className="text-primary font-semibold">₹{product.price}</p>
                          </div>
                          
                          {/* Toggles */}
                          <div className="flex flex-col gap-2 items-end">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{t.inStock}</span>
                              <Switch
                                checked={product.inStock}
                                onCheckedChange={(checked) => handleToggleStock(shop.id, product.id, checked)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{t.active}</span>
                              <Switch
                                checked={product.isActive}
                                onCheckedChange={(checked) => handleToggleActive(shop.id, product.id, checked)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Product Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingProduct ? t.editProduct : t.addProduct}
            </SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            {/* Telugu Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t.productNameTe} *
              </label>
              <input
                type="text"
                value={formData.name_te}
                onChange={(e) => setFormData(prev => ({ ...prev, name_te: e.target.value }))}
                className="input-village"
                placeholder="తెలుగులో పేరు"
              />
            </div>
            
            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t.productNameEn} *
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                className="input-village"
                placeholder="Name in English"
              />
            </div>
            
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t.price} (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="input-village"
                placeholder="0"
                min="1"
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t.category}
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="input-village"
                placeholder="Optional"
              />
            </div>
            
            {/* Toggles */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <span className="font-medium">{t.inStock}</span>
              <Switch
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <span className="font-medium">{t.active}</span>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full btn-primary"
            >
              {t.saveProduct}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
