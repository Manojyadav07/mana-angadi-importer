// Mana Angadi Data Types

export type UserRole = 'customer' | 'merchant' | 'delivery' | 'admin';

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
  // UPI details for payments
  upiVpa?: string;
  upiPayeeName?: string;
  villageId?: string;
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

// Payment types
export type PaymentMethod = 'COD' | 'UPI';
export type PaymentStatus = 'Unpaid' | 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  shopName_te: string;
  shopName_en: string;
  shopType: ShopType;
  status: OrderStatus;
  // Pricing breakdown
  subtotal: number;
  deliveryFee: number;
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
  // Address snapshots (bilingual)
  deliveryAddressId?: string;
  customerAddressText_te?: string;
  customerAddressText_en?: string;
  deliveryInstructions_te?: string;
  deliveryInstructions_en?: string;
  // Pickup/Drop location snapshots
  pickupLatSnapshot?: number;
  pickupLngSnapshot?: number;
  dropLatSnapshot?: number;
  dropLngSnapshot?: number;
  // Distance and ETA
  approxDistanceKm?: number;
  etaMin?: number;
  etaMax?: number;
  // Payment fields
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  upiVpaUsed?: string;
  upiTxnRef?: string;
  upiProofImageUrl?: string;
  paidAt?: Date;
  codChangeNeededFor?: number;
  // Legacy field for backward compatibility
  customerAddressText?: string;
}

// Customer Address for reuse
export interface CustomerAddress {
  id: string;
  userId: string;
  label_te: string;
  label_en: string;
  receiverName?: string;
  phone?: string;
  village_te: string;
  village_en: string;
  houseDetails_te?: string;
  houseDetails_en?: string;
  landmark_te: string;
  landmark_en: string;
  area_te?: string;
  area_en?: string;
  deliveryInstructions_te?: string;
  deliveryInstructions_en?: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

// Delivery Fee Rules
export interface DeliveryFeeRule {
  id: string;
  villageKey?: string;
  baseFeeKirana: number;
  baseFeeRestaurant: number;
  baseFeeMedical: number;
  perKmFee?: number;
  freeDeliveryMinOrder?: number;
  maxFeeCap?: number;
  minOrderRestaurant?: number;
  isActive: boolean;
}

// Village for admin management
export interface Village {
  id: string;
  name_te: string;
  name_en: string;
  mandal_te?: string;
  mandal_en?: string;
  district_te?: string;
  district_en?: string;
  pinCode?: string;
  isActive: boolean;
}

// Onboarding request for admin
export type OnboardingRequestType = 'merchant' | 'shop';
export type OnboardingRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface OnboardingRequest {
  id: string;
  requestType: OnboardingRequestType;
  name: string;
  phone: string;
  shopType?: ShopType;
  shopName_te?: string;
  shopName_en?: string;
  villageId?: string;
  status: OnboardingRequestStatus;
  createdAt: Date;
}

// Default coordinates for Metpally (Shops) and Metlachittapur (Customer)
export const METPALLY_COORDS = { lat: 18.8305, lng: 78.6098 }; // Metpally, Telangana 505325
export const METLACHITTAPUR_COORDS = { lat: 18.7892, lng: 78.5723 }; // Metlachittapur village

// Default delivery fee rules
export const DEFAULT_DELIVERY_FEE_RULES: DeliveryFeeRule = {
  id: 'default_rule',
  villageKey: 'metlachittapur',
  baseFeeKirana: 15,
  baseFeeRestaurant: 20,
  baseFeeMedical: 25,
  perKmFee: 5,
  freeDeliveryMinOrder: 500,
  maxFeeCap: 50,
  minOrderRestaurant: 100,
  isActive: true,
};

// Support contact config
export const SUPPORT_CONFIG = {
  phone: '+919876543210',
  whatsappNumber: '919876543210',
  upiVpa: 'manaangadi@upi',
  upiPayeeName: 'Mana Angadi',
};

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

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate delivery fee based on rules
export function calculateDeliveryFee(
  shopType: ShopType,
  distanceKm: number | undefined,
  subtotal: number,
  rules: DeliveryFeeRule = DEFAULT_DELIVERY_FEE_RULES
): { fee: number; freeDelivery: boolean; reason?: string } {
  // Check for free delivery
  if (rules.freeDeliveryMinOrder && subtotal >= rules.freeDeliveryMinOrder) {
    return { fee: 0, freeDelivery: true, reason: 'freeDeliveryThreshold' };
  }

  // Get base fee by shop type
  let baseFee: number;
  switch (shopType) {
    case 'kirana':
      baseFee = rules.baseFeeKirana;
      break;
    case 'restaurant':
      baseFee = rules.baseFeeRestaurant;
      break;
    case 'medical':
      baseFee = rules.baseFeeMedical;
      break;
    default:
      baseFee = rules.baseFeeKirana;
  }

  // Add per km fee if distance available
  let fee = baseFee;
  if (distanceKm !== undefined && rules.perKmFee) {
    fee += Math.ceil(distanceKm) * rules.perKmFee;
  }

  // Apply cap
  if (rules.maxFeeCap && fee > rules.maxFeeCap) {
    fee = rules.maxFeeCap;
  }

  return { fee, freeDelivery: false };
}

// Calculate ETA based on distance
export function calculateETA(distanceKm: number | undefined): { min: number; max: number } | null {
  if (distanceKm === undefined) return null;

  if (distanceKm <= 3) {
    return { min: 15, max: 25 };
  } else if (distanceKm <= 6) {
    return { min: 25, max: 40 };
  } else if (distanceKm <= 10) {
    return { min: 40, max: 60 };
  } else {
    return { min: 60, max: 90 };
  }
}

// Format address for display
export function formatAddress(
  address: CustomerAddress,
  language: 'te' | 'en'
): string {
  const label = language === 'en' ? address.label_en : address.label_te;
  const landmark = language === 'en' ? address.landmark_en : address.landmark_te;
  const house = language === 'en' ? address.houseDetails_en : address.houseDetails_te;
  const area = language === 'en' ? address.area_en : address.area_te;
  const village = language === 'en' ? address.village_en : address.village_te;

  const parts = [label, landmark];
  if (house) parts.push(house);
  if (area) parts.push(area);
  parts.push(village);

  return parts.join(' • ');
}
