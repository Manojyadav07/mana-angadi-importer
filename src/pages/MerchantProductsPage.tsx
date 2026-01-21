import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchantShop } from '@/hooks/useShops';
import { useMerchantProducts, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { Package, Plus, ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { Product, getLocalizedName } from '@/types';
import { Switch } from '@/components/ui/switch';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';

export function MerchantProductsPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  
  // Fetch merchant's shop
  const { data: shop, isLoading: shopLoading } = useMerchantShop(user?.id);
  
  // Fetch products for the shop
  const { data: products = [], isLoading: productsLoading, refetch } = useMerchantProducts(shop?.id);
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  
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

  const handleAddNew = () => {
    setEditingProduct(null);
    resetForm();
    setShowAddSheet(true);
  };

  const handleSave = async () => {
    if (!formData.name_te || !formData.name_en || !formData.price) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లను పూరించండి');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error(language === 'en' ? 'Please enter a valid price' : 'దయచేసి సరైన ధర నమోదు చేయండి');
      return;
    }

    if (!shop) {
      toast.error('No shop found');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          updates: {
            name_te: formData.name_te,
            name_en: formData.name_en,
            price,
            inStock: formData.inStock,
            isActive: formData.isActive,
          },
        });
      } else {
        await createProduct.mutateAsync({
          shopId: shop.id,
          name_te: formData.name_te,
          name_en: formData.name_en,
          price,
          inStock: formData.inStock,
          isActive: formData.isActive,
        });
      }

      toast.success(t.productSaved);
      setShowAddSheet(false);
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(language === 'en' ? 'Failed to save product' : 'ఉత్పత్తి సేవ్ చేయడంలో విఫలమైంది');
    }
  };

  const handleToggleStock = async (productId: string, inStock: boolean) => {
    try {
      await updateProduct.mutateAsync({ id: productId, updates: { inStock } });
    } catch (err) {
      console.error('Toggle stock error:', err);
    }
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      await updateProduct.mutateAsync({ id: productId, updates: { isActive } });
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const isLoading = shopLoading || productsLoading;

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
      ) : !shop ? (
        <div className="px-4">
          <div className="bg-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">
              {language === 'en' ? 'No shop found. Please set up your shop first.' : 'దుకాణం కనుగొనబడలేదు. దయచేసి మీ దుకాణాన్ని సెటప్ చేయండి.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">
              {getLocalizedName(shop, language)}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="p-2 rounded-full bg-muted/50 text-muted-foreground"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {t.addProduct}
              </button>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="bg-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t.noProducts}</p>
              <button
                onClick={handleAddNew}
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
                          onCheckedChange={(checked) => handleToggleStock(product.id, checked)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t.active}</span>
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
