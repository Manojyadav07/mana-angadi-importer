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
    { id: 'p1_1', shopId: 'shop_1', name_te: 'బియ్యం (1 కేజీ)', name_en: 'Rice (1 kg)', price: 55, inStock: true, unit_te: 'కేజీ', unit_en: 'kg' },
    { id: 'p1_2', shopId: 'shop_1', name_te: 'పప్పు (500 గ్రా)', name_en: 'Dal (500 g)', price: 85, inStock: true, unit_te: '500గ్రా', unit_en: '500g' },
    { id: 'p1_3', shopId: 'shop_1', name_te: 'నూనె (1 లీ)', name_en: 'Oil (1 L)', price: 145, inStock: true, unit_te: 'లీటర్', unit_en: 'Liter' },
    { id: 'p1_4', shopId: 'shop_1', name_te: 'చక్కెర (1 కేజీ)', name_en: 'Sugar (1 kg)', price: 45, inStock: true, unit_te: 'కేజీ', unit_en: 'kg' },
    { id: 'p1_5', shopId: 'shop_1', name_te: 'ఉప్పు (1 కేజీ)', name_en: 'Salt (1 kg)', price: 25, inStock: true, unit_te: 'కేజీ', unit_en: 'kg' },
    { id: 'p1_6', shopId: 'shop_1', name_te: 'మిర్చి పొడి (100 గ్రా)', name_en: 'Chilli Powder (100 g)', price: 35, inStock: false, unit_te: '100గ్రా', unit_en: '100g' },
    { id: 'p1_7', shopId: 'shop_1', name_te: 'పసుపు (50 గ్రా)', name_en: 'Turmeric (50 g)', price: 20, inStock: true, unit_te: '50గ్రా', unit_en: '50g' },
    { id: 'p1_8', shopId: 'shop_1', name_te: 'టీ పొడి (250 గ్రా)', name_en: 'Tea Powder (250 g)', price: 120, inStock: true, unit_te: '250గ్రా', unit_en: '250g' },
  ],
  shop_2: [
    { id: 'p2_1', shopId: 'shop_2', name_te: 'ఇడ్లీ (4 పీసెస్)', name_en: 'Idli (4 pcs)', price: 30, inStock: true },
    { id: 'p2_2', shopId: 'shop_2', name_te: 'దోస', name_en: 'Dosa', price: 35, inStock: true },
    { id: 'p2_3', shopId: 'shop_2', name_te: 'వడ (2 పీసెస్)', name_en: 'Vada (2 pcs)', price: 25, inStock: true },
    { id: 'p2_4', shopId: 'shop_2', name_te: 'పూరీ (4 పీసెస్)', name_en: 'Poori (4 pcs)', price: 40, inStock: true },
    { id: 'p2_5', shopId: 'shop_2', name_te: 'చాయ్', name_en: 'Tea', price: 10, inStock: true },
    { id: 'p2_6', shopId: 'shop_2', name_te: 'బిర్యానీ', name_en: 'Biryani', price: 120, inStock: false },
    { id: 'p2_7', shopId: 'shop_2', name_te: 'అన్నం + సాంబార్', name_en: 'Rice + Sambar', price: 50, inStock: true },
  ],
  shop_3: [
    { id: 'p3_1', shopId: 'shop_3', name_te: 'పారాసిటమాల్', name_en: 'Paracetamol', price: 15, inStock: true },
    { id: 'p3_2', shopId: 'shop_3', name_te: 'ORS పొడి', name_en: 'ORS Powder', price: 25, inStock: true },
    { id: 'p3_3', shopId: 'shop_3', name_te: 'బ్యాండేజ్', name_en: 'Bandage', price: 30, inStock: true },
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
