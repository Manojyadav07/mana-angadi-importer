import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  User, Order, OrderStatus, Shop, UserRole, LocationUpdate, 
  METPALLY_COORDS, METLACHITTAPUR_COORDS, PaymentMethod, PaymentStatus,
  CustomerAddress, calculateDistanceKm, calculateDeliveryFee, calculateETA, formatAddress
} from '@/types';

interface AppContextType {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isMerchant: boolean;
  isDelivery: boolean;
  isAdmin: boolean;
  login: (phone: string, name?: string, role?: UserRole, shopIds?: string[]) => void;
  logout: () => void;
  updateUserName: (name: string) => void;
  updateUserAvailability: (isAvailable: boolean) => void;
  acknowledgeInsurance: () => void;

  // Orders state (legacy local — kept for backward compat, DB hooks preferred)
  orders: Order[];
  placeOrder: (options: PlaceOrderOptions) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByShopIds: (shopIds: string[]) => Order[];
  getReadyOrders: () => Order[];
  getDeliveryPartnerOrders: (deliveryPartnerId: string) => Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus, rejectionReason_te?: string, rejectionReason_en?: string) => void;
  acceptDelivery: (orderId: string, deliveryPartnerId: string, deliveryPartnerName: string) => void;
  updateDeliveryStatus: (orderId: string, status: 'pickedUp' | 'onTheWay' | 'delivered') => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  
  // Location tracking
  locationUpdates: LocationUpdate[];
  updateLocation: (orderId: string, lat: number, lng: number) => void;
  getLatestLocation: (orderId: string) => LocationUpdate | undefined;
}

interface PlaceOrderOptions {
  shop: Shop;
  note?: string;
  address?: CustomerAddress;
  paymentMethod?: PaymentMethod;
  codChangeNeeded?: number;
  upiTxnRef?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([]);

  // Auth functions
  const login = useCallback((phone: string, name?: string, role: UserRole = 'customer', shopIds?: string[]) => {
    const userId = role === 'merchant' ? 'merchant_1' : role === 'delivery' ? 'delivery_1' : role === 'admin' ? 'admin_1' : `user_${Date.now()}`;
    setUser({
      id: userId,
      name: name || '',
      phone,
      role,
      village: 'Metlachittapur',
      shopIds: shopIds || (role === 'merchant' ? ['shop_1', 'shop_2'] : undefined),
      isAvailable: role === 'delivery' ? true : undefined,
      insuranceAcknowledged: role === 'delivery' ? false : undefined,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setOrders([]);
    setLocationUpdates([]);
  }, []);

  const updateUserName = useCallback((name: string) => {
    setUser(prev => prev ? { ...prev, name } : null);
  }, []);

  const updateUserAvailability = useCallback((isAvailable: boolean) => {
    setUser(prev => prev ? { ...prev, isAvailable } : null);
  }, []);

  const acknowledgeInsurance = useCallback(() => {
    setUser(prev => prev ? { ...prev, insuranceAcknowledged: true } : null);
  }, []);

  // Order functions (legacy local state — DB hooks are preferred)
  const placeOrder = useCallback((options: PlaceOrderOptions): Order => {
    const { shop, note, address, paymentMethod = 'COD', codChangeNeeded, upiTxnRef } = options;
    const pickupLat = shop.pickupLat ?? METPALLY_COORDS.lat;
    const pickupLng = shop.pickupLng ?? METPALLY_COORDS.lng;
    const dropLat = address?.lat ?? METLACHITTAPUR_COORDS.lat;
    const dropLng = address?.lng ?? METLACHITTAPUR_COORDS.lng;
    const distanceKm = calculateDistanceKm(pickupLat, pickupLng, dropLat, dropLng);
    const subtotal = 0;
    const { fee: deliveryFee } = calculateDeliveryFee(shop.type, distanceKm, subtotal);
    const eta = calculateETA(distanceKm);
    const addressText_te = address ? formatAddress(address, 'te') : 'రామాలయం దగ్గర, మెట్లచిట్టాపూర్';
    const addressText_en = address ? formatAddress(address, 'en') : 'Near Temple, Metlachittapur';
    
    const newOrder: Order = {
      id: `ORD${Date.now().toString().slice(-8)}`,
      customerId: user?.id || '',
      shopId: shop.id,
      shopName_te: shop.name_te,
      shopName_en: shop.name_en,
      shopType: shop.type,
      status: 'placed' as OrderStatus,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      items: [],
      createdAt: new Date(),
      statusUpdatedAt: new Date(),
      customerNote: note,
      deliveryAddressId: address?.id,
      customerAddressText_te: addressText_te,
      customerAddressText_en: addressText_en,
      customerAddressText: addressText_en,
      deliveryInstructions_te: address?.deliveryInstructions_te,
      deliveryInstructions_en: address?.deliveryInstructions_en,
      pickupLatSnapshot: pickupLat,
      pickupLngSnapshot: pickupLng,
      dropLatSnapshot: dropLat,
      dropLngSnapshot: dropLng,
      approxDistanceKm: distanceKm,
      etaMin: eta?.min,
      etaMax: eta?.max,
      paymentMethod,
      paymentStatus: paymentMethod === 'UPI' ? 'Pending' : 'Unpaid',
      upiTxnRef,
      codChangeNeededFor: codChangeNeeded,
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, [user]);

  const getOrderById = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const getOrdersByShopIds = useCallback((shopIds: string[]) => {
    return orders.filter(order => shopIds.includes(order.shopId));
  }, [orders]);

  const getReadyOrders = useCallback(() => {
    return orders.filter(order => order.status === 'ready' && !order.deliveryPartnerId);
  }, [orders]);

  const getDeliveryPartnerOrders = useCallback((deliveryPartnerId: string) => {
    return orders.filter(order => order.deliveryPartnerId === deliveryPartnerId);
  }, [orders]);

  const updateOrderStatus = useCallback((
    orderId: string, status: OrderStatus, rejectionReason_te?: string, rejectionReason_en?: string
  ) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updates: Partial<Order> = { status, statusUpdatedAt: new Date(), rejectionReason_te, rejectionReason_en };
        if (status === 'accepted') updates.acceptedAt = new Date();
        else if (status === 'ready') updates.readyAt = new Date();
        return { ...order, ...updates };
      })
    );
  }, []);

  const acceptDelivery = useCallback((orderId: string, deliveryPartnerId: string, deliveryPartnerName: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'assigned' as OrderStatus, deliveryPartnerId, deliveryPartnerName, assignedAt: new Date(), statusUpdatedAt: new Date() }
          : order
      )
    );
  }, []);

  const updateDeliveryStatus = useCallback((orderId: string, status: 'pickedUp' | 'onTheWay' | 'delivered') => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updates: Partial<Order> = { status, statusUpdatedAt: new Date() };
        if (status === 'pickedUp') updates.pickedUpAt = new Date();
        else if (status === 'onTheWay') updates.onTheWayAt = new Date();
        else if (status === 'delivered') {
          updates.deliveredAt = new Date();
          if (order.paymentMethod === 'COD') { updates.paymentStatus = 'Paid'; updates.paidAt = new Date(); }
        }
        return { ...order, ...updates };
      })
    );
  }, []);

  const updatePaymentStatus = useCallback((orderId: string, status: PaymentStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, paymentStatus: status, paidAt: status === 'Paid' ? new Date() : order.paidAt }
          : order
      )
    );
  }, []);

  const updateLocation = useCallback((orderId: string, lat: number, lng: number) => {
    if (!user) return;
    setLocationUpdates(prev => [...prev, { orderId, deliveryPartnerId: user.id, lat, lng, createdAt: new Date() }]);
  }, [user]);

  const getLatestLocation = useCallback((orderId: string) => {
    const orderUpdates = locationUpdates.filter(u => u.orderId === orderId);
    return orderUpdates.length > 0 ? orderUpdates[orderUpdates.length - 1] : undefined;
  }, [locationUpdates]);

  const value: AppContextType = {
    user, isAuthenticated: !!user, isMerchant: user?.role === 'merchant', isDelivery: user?.role === 'delivery', isAdmin: user?.role === 'admin',
    login, logout, updateUserName, updateUserAvailability, acknowledgeInsurance,
    orders, placeOrder, getOrderById, getOrdersByShopIds, getReadyOrders, getDeliveryPartnerOrders,
    updateOrderStatus, acceptDelivery, updateDeliveryStatus, updatePaymentStatus,
    locationUpdates, updateLocation, getLatestLocation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
