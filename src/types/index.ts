// Mana Angadi Data Types

export type UserRole = 'customer' | 'merchant' | 'delivery';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  village: string;
  language?: 'te' | 'en';
  // For merchants: list of shop IDs they own
  shopIds?: string[];
  // For delivery partners
  isAvailable?: boolean;
  insuranceAcknowledged?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
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
  // Pickup location coordinates (Metpally)
  pickupLat?: number;
  pickupLng?: number;
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

// Extended order statuses for delivery workflow
export type OrderStatus = 'placed' | 'accepted' | 'rejected' | 'ready' | 'assigned' | 'pickedUp' | 'onTheWay' | 'delivered';

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
  // Timeline timestamps
  acceptedAt?: Date;
  readyAt?: Date;
  // Delivery partner fields
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  assignedAt?: Date;
  pickedUpAt?: Date;
  onTheWayAt?: Date;
  deliveredAt?: Date;
  customerAddressText?: string;
  deliveryFee?: number;
  // Pickup/Drop location snapshots
  pickupLatSnapshot?: number;
  pickupLngSnapshot?: number;
  dropLatSnapshot?: number;
  dropLngSnapshot?: number;
}

// Default coordinates for Metpally (Shops) and Metlachittapur (Customer)
export const METPALLY_COORDS = { lat: 18.8305, lng: 78.6098 }; // Metpally, Telangana 505325
export const METLACHITTAPUR_COORDS = { lat: 18.7892, lng: 78.5723 }; // Metlachittapur village

export interface OrderItem {
  productId: string;
  // Snapshot fields for bilingual order history
  productName_te: string;
  productName_en: string;
  quantity: number;
  price: number;
}

export interface LocationUpdate {
  orderId: string;
  deliveryPartnerId: string;
  lat: number;
  lng: number;
  createdAt: Date;
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

// Get delivery status for stepper
export function getDeliveryStatusStep(status: OrderStatus): number {
  switch (status) {
    case 'ready': return 0;
    case 'assigned': return 1;
    case 'pickedUp': return 2;
    case 'onTheWay': return 3;
    case 'delivered': return 4;
    default: return -1;
  }
}
