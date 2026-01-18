import { Shop, Product, ShopType } from '@/types';

export const shops: Shop[] = [
  {
    id: 'shop_1',
    ownerId: 'merchant_1',
    name_te: 'రాజు కిరాణా స్టోర్',
    name_en: 'Raju Kirana Store',
    type: 'kirana' as ShopType,
    type_te: 'కిరాణా',
    type_en: 'Grocery',
    isOpen: true,
    isActive: true,
    // Metpally location
    pickupLat: 18.8305,
    pickupLng: 78.6098,
  },
  {
    id: 'shop_2',
    ownerId: 'merchant_1',
    name_te: 'లక్ష్మి హోటల్',
    name_en: 'Lakshmi Hotel',
    type: 'restaurant' as ShopType,
    type_te: 'హోటల్',
    type_en: 'Restaurant',
    isOpen: true,
    isActive: true,
    pickupLat: 18.8310,
    pickupLng: 78.6102,
  },
  {
    id: 'shop_3',
    ownerId: 'merchant_2',
    name_te: 'వెంకట మెడికల్స్',
    name_en: 'Venkata Medicals',
    type: 'medical' as ShopType,
    type_te: 'మెడికల్',
    type_en: 'Medical',
    isOpen: false,
    isActive: true,
    pickupLat: 18.8298,
    pickupLng: 78.6085,
  },
  {
    id: 'shop_4',
    ownerId: 'merchant_2',
    name_te: 'సాయి కిరాణా',
    name_en: 'Sai Kirana',
    type: 'kirana' as ShopType,
    type_te: 'కిరాణా',
    type_en: 'Grocery',
    isOpen: true,
    isActive: true,
    pickupLat: 18.8315,
    pickupLng: 78.6110,
  },
];

export const products: Record<string, Product[]> = {
  shop_1: [
    { id: 'p1_1', shopId: 'shop_1', name_te: 'బియ్యం (1 కేజీ)', name_en: 'Rice (1 kg)', price: 55, inStock: true, isActive: true, unit_te: 'కేజీ', unit_en: 'kg', category: 'Staples', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
    { id: 'p1_2', shopId: 'shop_1', name_te: 'పప్పు (500 గ్రా)', name_en: 'Dal (500 g)', price: 85, inStock: true, isActive: true, unit_te: '500గ్రా', unit_en: '500g', category: 'Staples', image: 'https://images.unsplash.com/photo-1613758947307-f3b8f5d80711?w=200&h=200&fit=crop' },
    { id: 'p1_3', shopId: 'shop_1', name_te: 'నూనె (1 లీ)', name_en: 'Oil (1 L)', price: 145, inStock: true, isActive: true, unit_te: 'లీటర్', unit_en: 'Liter', category: 'Oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop' },
    { id: 'p1_4', shopId: 'shop_1', name_te: 'చక్కెర (1 కేజీ)', name_en: 'Sugar (1 kg)', price: 45, inStock: true, isActive: true, unit_te: 'కేజీ', unit_en: 'kg', category: 'Staples', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop' },
    { id: 'p1_5', shopId: 'shop_1', name_te: 'ఉప్పు (1 కేజీ)', name_en: 'Salt (1 kg)', price: 25, inStock: true, isActive: true, unit_te: 'కేజీ', unit_en: 'kg', category: 'Staples', image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=200&h=200&fit=crop' },
    { id: 'p1_6', shopId: 'shop_1', name_te: 'మిర్చి పొడి (100 గ్రా)', name_en: 'Chilli Powder (100 g)', price: 35, inStock: false, isActive: true, unit_te: '100గ్రా', unit_en: '100g', category: 'Spices', image: 'https://images.unsplash.com/photo-1599909533173-ef7d4f6d8e65?w=200&h=200&fit=crop' },
    { id: 'p1_7', shopId: 'shop_1', name_te: 'పసుపు (50 గ్రా)', name_en: 'Turmeric (50 g)', price: 20, inStock: true, isActive: true, unit_te: '50గ్రా', unit_en: '50g', category: 'Spices', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200&h=200&fit=crop' },
    { id: 'p1_8', shopId: 'shop_1', name_te: 'టీ పొడి (250 గ్రా)', name_en: 'Tea Powder (250 g)', price: 120, inStock: true, isActive: true, unit_te: '250గ్రా', unit_en: '250g', category: 'Beverages', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop' },
    { id: 'p1_9', shopId: 'shop_1', name_te: 'ఆవాలు (100 గ్రా)', name_en: 'Mustard Seeds (100 g)', price: 30, inStock: true, isActive: true, unit_te: '100గ్రా', unit_en: '100g', category: 'Spices', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=200&fit=crop' },
    { id: 'p1_10', shopId: 'shop_1', name_te: 'జీలకర్ర (100 గ్రా)', name_en: 'Cumin Seeds (100 g)', price: 45, inStock: true, isActive: true, unit_te: '100గ్రా', unit_en: '100g', category: 'Spices', image: 'https://images.unsplash.com/photo-1599909533173-ef7d4f6d8e65?w=200&h=200&fit=crop' },
  ],
  shop_2: [
    { id: 'p2_1', shopId: 'shop_2', name_te: 'ఇడ్లీ (4 పీసెస్)', name_en: 'Idli (4 pcs)', price: 30, inStock: true, isActive: true, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&h=200&fit=crop' },
    { id: 'p2_2', shopId: 'shop_2', name_te: 'దోస', name_en: 'Dosa', price: 35, inStock: true, isActive: true, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&h=200&fit=crop' },
    { id: 'p2_3', shopId: 'shop_2', name_te: 'వడ (2 పీసెస్)', name_en: 'Vada (2 pcs)', price: 25, inStock: true, isActive: true, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=200&h=200&fit=crop' },
    { id: 'p2_4', shopId: 'shop_2', name_te: 'పూరీ (4 పీసెస్)', name_en: 'Poori (4 pcs)', price: 40, inStock: true, isActive: true, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=200&h=200&fit=crop' },
    { id: 'p2_5', shopId: 'shop_2', name_te: 'చాయ్', name_en: 'Tea', price: 10, inStock: true, isActive: true, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop' },
    { id: 'p2_6', shopId: 'shop_2', name_te: 'బిర్యానీ', name_en: 'Biryani', price: 120, inStock: false, isActive: true, category: 'Rice', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop' },
    { id: 'p2_7', shopId: 'shop_2', name_te: 'అన్నం + సాంబార్', name_en: 'Rice + Sambar', price: 50, inStock: true, isActive: true, category: 'Meals', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop' },
    { id: 'p2_8', shopId: 'shop_2', name_te: 'పెసరట్టు', name_en: 'Pesarattu', price: 40, inStock: true, isActive: true, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&h=200&fit=crop' },
    { id: 'p2_9', shopId: 'shop_2', name_te: 'ఉప్మా', name_en: 'Upma', price: 25, inStock: true, isActive: true, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=200&h=200&fit=crop' },
  ],
  shop_3: [
    { id: 'p3_1', shopId: 'shop_3', name_te: 'పారాసిటమాల్', name_en: 'Paracetamol', price: 15, inStock: true, isActive: true, category: 'Pain Relief', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop' },
    { id: 'p3_2', shopId: 'shop_3', name_te: 'ORS పొడి', name_en: 'ORS Powder', price: 25, inStock: true, isActive: true, category: 'General', image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&h=200&fit=crop' },
    { id: 'p3_3', shopId: 'shop_3', name_te: 'బ్యాండేజ్', name_en: 'Bandage', price: 30, inStock: true, isActive: true, category: 'First Aid', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop' },
    { id: 'p3_4', shopId: 'shop_3', name_te: 'డెట్టాల్', name_en: 'Dettol', price: 65, inStock: true, isActive: true, category: 'Antiseptic', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&h=200&fit=crop' },
    { id: 'p3_5', shopId: 'shop_3', name_te: 'కాటన్', name_en: 'Cotton', price: 20, inStock: true, isActive: true, category: 'First Aid', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop' },
  ],
  shop_4: [
    { id: 'p4_1', shopId: 'shop_4', name_te: 'గోధుమ పిండి (1 కేజీ)', name_en: 'Wheat Flour (1 kg)', price: 45, inStock: true, isActive: true, unit_te: 'కేజీ', unit_en: 'kg', category: 'Staples', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop' },
    { id: 'p4_2', shopId: 'shop_4', name_te: 'రవ్వ (500 గ్రా)', name_en: 'Semolina (500 g)', price: 35, inStock: true, isActive: true, unit_te: '500గ్రా', unit_en: '500g', category: 'Staples', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
    { id: 'p4_3', shopId: 'shop_4', name_te: 'మైదా (500 గ్రా)', name_en: 'Maida (500 g)', price: 30, inStock: true, isActive: true, unit_te: '500గ్రా', unit_en: '500g', category: 'Staples', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop' },
    { id: 'p4_4', shopId: 'shop_4', name_te: 'పాల పొడి (200 గ్రా)', name_en: 'Milk Powder (200 g)', price: 95, inStock: true, isActive: true, unit_te: '200గ్రా', unit_en: '200g', category: 'Dairy', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop' },
    { id: 'p4_5', shopId: 'shop_4', name_te: 'బిస్కెట్లు', name_en: 'Biscuits', price: 20, inStock: true, isActive: true, category: 'Snacks', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop' },
    { id: 'p4_6', shopId: 'shop_4', name_te: 'సబ్బు', name_en: 'Soap', price: 35, inStock: true, isActive: true, category: 'Personal Care', image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=200&h=200&fit=crop' },
  ],
};

// Mutable products for merchant editing
let mutableProducts = JSON.parse(JSON.stringify(products));
let mutableShops = JSON.parse(JSON.stringify(shops));

export function getShops(): Shop[] {
  return mutableShops;
}

export function getShopById(id: string): Shop | undefined {
  return mutableShops.find((shop: Shop) => shop.id === id);
}

export function getProductsByShopId(shopId: string): Product[] {
  return mutableProducts[shopId] || [];
}

export function getShopsByOwner(ownerId: string): Shop[] {
  return mutableShops.filter((shop: Shop) => shop.ownerId === ownerId);
}

export function updateShopOpenStatus(shopId: string, isOpen: boolean): void {
  const shop = mutableShops.find((s: Shop) => s.id === shopId);
  if (shop) {
    shop.isOpen = isOpen;
  }
}

export function updateProduct(shopId: string, productId: string, updates: Partial<Product>): void {
  const shopProducts = mutableProducts[shopId];
  if (shopProducts) {
    const index = shopProducts.findIndex((p: Product) => p.id === productId);
    if (index !== -1) {
      shopProducts[index] = { ...shopProducts[index], ...updates };
    }
  }
}

export function addProduct(shopId: string, product: Product): void {
  if (!mutableProducts[shopId]) {
    mutableProducts[shopId] = [];
  }
  mutableProducts[shopId].push(product);
}

// Helper to get localized name for shops/products
export function getLocalizedName(
  item: { name_te: string; name_en: string },
  language: 'te' | 'en'
): string {
  return language === 'en' ? item.name_en : item.name_te;
}

// Helper to get localized shop type
export function getLocalizedShopType(
  shop: Shop,
  language: 'te' | 'en'
): string {
  return language === 'en' ? shop.type_en : shop.type_te;
}
