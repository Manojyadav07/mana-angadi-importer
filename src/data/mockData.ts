import { Shop, Product } from '@/types';

export const shops: Shop[] = [
  {
    id: 'shop_1',
    name_te: 'రాజు కిరాణా స్టోర్',
    name_en: 'Raju Kirana Store',
    type_te: 'కిరాణా',
    type_en: 'Grocery',
    isOpen: true,
  },
  {
    id: 'shop_2',
    name_te: 'లక్ష్మి హోటల్',
    name_en: 'Lakshmi Hotel',
    type_te: 'హోటల్',
    type_en: 'Restaurant',
    isOpen: true,
  },
  {
    id: 'shop_3',
    name_te: 'వెంకట మెడికల్స్',
    name_en: 'Venkata Medicals',
    type_te: 'మెడికల్',
    type_en: 'Medical',
    isOpen: false,
  },
];

export const products: Record<string, Product[]> = {
  shop_1: [
    { id: 'p1_1', shopId: 'shop_1', name_te: 'బియ్యం (1 కేజీ)', name_en: 'Rice (1 kg)', price: 55, inStock: true, unit_te: 'కేజీ', unit_en: 'kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
    { id: 'p1_2', shopId: 'shop_1', name_te: 'పప్పు (500 గ్రా)', name_en: 'Dal (500 g)', price: 85, inStock: true, unit_te: '500గ్రా', unit_en: '500g', image: 'https://images.unsplash.com/photo-1613758947307-f3b8f5d80711?w=200&h=200&fit=crop' },
    { id: 'p1_3', shopId: 'shop_1', name_te: 'నూనె (1 లీ)', name_en: 'Oil (1 L)', price: 145, inStock: true, unit_te: 'లీటర్', unit_en: 'Liter', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop' },
    { id: 'p1_4', shopId: 'shop_1', name_te: 'చక్కెర (1 కేజీ)', name_en: 'Sugar (1 kg)', price: 45, inStock: true, unit_te: 'కేజీ', unit_en: 'kg', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop' },
    { id: 'p1_5', shopId: 'shop_1', name_te: 'ఉప్పు (1 కేజీ)', name_en: 'Salt (1 kg)', price: 25, inStock: true, unit_te: 'కేజీ', unit_en: 'kg', image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=200&h=200&fit=crop' },
    { id: 'p1_6', shopId: 'shop_1', name_te: 'మిర్చి పొడి (100 గ్రా)', name_en: 'Chilli Powder (100 g)', price: 35, inStock: false, unit_te: '100గ్రా', unit_en: '100g', image: 'https://images.unsplash.com/photo-1599909533173-ef7d4f6d8e65?w=200&h=200&fit=crop' },
    { id: 'p1_7', shopId: 'shop_1', name_te: 'పసుపు (50 గ్రా)', name_en: 'Turmeric (50 g)', price: 20, inStock: true, unit_te: '50గ్రా', unit_en: '50g', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200&h=200&fit=crop' },
    { id: 'p1_8', shopId: 'shop_1', name_te: 'టీ పొడి (250 గ్రా)', name_en: 'Tea Powder (250 g)', price: 120, inStock: true, unit_te: '250గ్రా', unit_en: '250g', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop' },
  ],
  shop_2: [
    { id: 'p2_1', shopId: 'shop_2', name_te: 'ఇడ్లీ (4 పీసెస్)', name_en: 'Idli (4 pcs)', price: 30, inStock: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&h=200&fit=crop' },
    { id: 'p2_2', shopId: 'shop_2', name_te: 'దోస', name_en: 'Dosa', price: 35, inStock: true, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&h=200&fit=crop' },
    { id: 'p2_3', shopId: 'shop_2', name_te: 'వడ (2 పీసెస్)', name_en: 'Vada (2 pcs)', price: 25, inStock: true, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=200&h=200&fit=crop' },
    { id: 'p2_4', shopId: 'shop_2', name_te: 'పూరీ (4 పీసెస్)', name_en: 'Poori (4 pcs)', price: 40, inStock: true, image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=200&h=200&fit=crop' },
    { id: 'p2_5', shopId: 'shop_2', name_te: 'చాయ్', name_en: 'Tea', price: 10, inStock: true, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop' },
    { id: 'p2_6', shopId: 'shop_2', name_te: 'బిర్యానీ', name_en: 'Biryani', price: 120, inStock: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop' },
    { id: 'p2_7', shopId: 'shop_2', name_te: 'అన్నం + సాంబార్', name_en: 'Rice + Sambar', price: 50, inStock: true, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop' },
  ],
  shop_3: [
    { id: 'p3_1', shopId: 'shop_3', name_te: 'పారాసిటమాల్', name_en: 'Paracetamol', price: 15, inStock: true, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop' },
    { id: 'p3_2', shopId: 'shop_3', name_te: 'ORS పొడి', name_en: 'ORS Powder', price: 25, inStock: true, image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&h=200&fit=crop' },
    { id: 'p3_3', shopId: 'shop_3', name_te: 'బ్యాండేజ్', name_en: 'Bandage', price: 30, inStock: true, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop' },
  ],
};

export function getShopById(id: string): Shop | undefined {
  return shops.find(shop => shop.id === id);
}

export function getProductsByShopId(shopId: string): Product[] {
  return products[shopId] || [];
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
