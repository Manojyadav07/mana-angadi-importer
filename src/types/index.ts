// Mana Angadi Data Types

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'customer';
  village: string;
}

export interface Shop {
  id: string;
  name: string;
  type: 'కిరాణా' | 'హోటల్' | 'మెడికల్';
  typeEnglish: 'Grocery' | 'Restaurant' | 'Medical';
  isOpen: boolean;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  price: number;
  inStock: boolean;
  unit?: string;
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
  shopName: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// Status labels in Telugu
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'నమోదు అయ్యింది',
  accepted: 'అంగీకరించారు',
  ready: 'సిద్ధంగా ఉంది',
  delivered: 'డెలివరీ అయ్యింది',
};
