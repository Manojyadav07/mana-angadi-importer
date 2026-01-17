// Mana Angadi Data Types

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'customer';
  village: string;
  language?: 'te' | 'en';
}

export interface Shop {
  id: string;
  name_te: string;
  name_en: string;
  type_te: 'కిరాణా' | 'హోటల్' | 'మెడికల్';
  type_en: 'Grocery' | 'Restaurant' | 'Medical';
  isOpen: boolean;
}

export interface Product {
  id: string;
  shopId: string;
  name_te: string;
  name_en: string;
  price: number;
  inStock: boolean;
  unit_te?: string;
  unit_en?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'placed' | 'accepted' | 'ready' | 'delivered';

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  shopName_te: string;
  shopName_en: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  // Snapshot fields for bilingual order history
  productName_te: string;
  productName_en: string;
  quantity: number;
  price: number;
}

// Helper to get localized name
export function getLocalizedName(
  item: { name_te: string; name_en: string },
  language: 'te' | 'en'
): string {
  return language === 'en' ? item.name_en : item.name_te;
}

export function getLocalizedShopType(
  shop: Shop,
  language: 'te' | 'en'
): string {
  return language === 'en' ? shop.type_en : shop.type_te;
}
