// Mana Angadi Data Types

export type UserRole = 'customer' | 'merchant';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  village: string;
  language?: 'te' | 'en';
  // For merchants: list of shop IDs they own
  shopIds?: string[];
}

export type ShopType = 'kirana' | 'restaurant' | 'medical';

export interface Shop {
  id: string;
  ownerId?: string; // merchant user id
  name_te: string;
  name_en: string;
  type: ShopType;
  type_te: 'కిరాణా' | 'హోటల్' | 'మెడికల్';
  type_en: 'Grocery' | 'Restaurant' | 'Medical';
  isOpen: boolean;
  isActive: boolean;
  address_te?: string;
  address_en?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name_te: string;
  name_en: string;
  price: number;
  inStock: boolean;
  isActive: boolean;
  unit_te?: string;
  unit_en?: string;
  image?: string;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'placed' | 'accepted' | 'rejected' | 'ready' | 'delivered';

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  shopName_te: string;
  shopName_en: string;
  shopType: ShopType;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: Date;
  statusUpdatedAt?: Date;
  customerNote?: string;
  merchantNote_te?: string;
  merchantNote_en?: string;
  rejectionReason_te?: string;
  rejectionReason_en?: string;
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

// Get shop type icon
export function getShopTypeIcon(type: ShopType): string {
  switch (type) {
    case 'kirana': return '🛒';
    case 'restaurant': return '🍽️';
    case 'medical': return '💊';
    default: return '🏪';
  }
}
