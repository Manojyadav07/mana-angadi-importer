import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, CartItem, Order, Product, OrderStatus, Shop, UserRole, LocationUpdate, METPALLY_COORDS, METLACHITTAPUR_COORDS } from '@/types';
import { getShopById } from '@/data/mockData';

interface AppContextType {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isMerchant: boolean;
  isDelivery: boolean;
  login: (phone: string, name?: string, role?: UserRole, shopIds?: string[]) => void;
  logout: () => void;
  updateUserName: (name: string) => void;
  updateUserAvailability: (isAvailable: boolean) => void;
  acknowledgeInsurance: () => void;

  // Cart state
  cart: CartItem[];
  cartShopId: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;

  // Orders state
  orders: Order[];
  placeOrder: (shop: Shop, note?: string) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByShopIds: (shopIds: string[]) => Order[];
  getReadyOrders: () => Order[];
  getDeliveryPartnerOrders: (deliveryPartnerId: string) => Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus, rejectionReason_te?: string, rejectionReason_en?: string) => void;
  acceptDelivery: (orderId: string, deliveryPartnerId: string, deliveryPartnerName: string) => void;
  updateDeliveryStatus: (orderId: string, status: 'pickedUp' | 'onTheWay' | 'delivered') => void;
  
  // Location tracking
  locationUpdates: LocationUpdate[];
  updateLocation: (orderId: string, lat: number, lng: number) => void;
  getLatestLocation: (orderId: string) => LocationUpdate | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartShopId, setCartShopId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([]);

  // Auth functions
  const login = useCallback((phone: string, name?: string, role: UserRole = 'customer', shopIds?: string[]) => {
    const userId = role === 'merchant' ? 'merchant_1' : role === 'delivery' ? 'delivery_1' : `user_${Date.now()}`;
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
    setCart([]);
    setCartShopId(null);
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

  // Cart functions
  const addToCart = useCallback((product: Product) => {
    if (cartShopId && cartShopId !== product.shopId) {
      setCart([{ product, quantity: 1 }]);
      setCartShopId(product.shopId);
      return;
    }

    setCartShopId(product.shopId);
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, [cartShopId]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      if (newCart.length === 0) {
        setCartShopId(null);
      }
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setCartShopId(null);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Order functions
  const placeOrder = useCallback((shop: Shop, note?: string): Order => {
    // Get shop coordinates or use defaults
    const pickupLat = shop.pickupLat ?? METPALLY_COORDS.lat;
    const pickupLng = shop.pickupLng ?? METPALLY_COORDS.lng;
    
    const newOrder: Order = {
      id: `ORD${Date.now().toString().slice(-8)}`,
      customerId: user?.id || '',
      shopId: shop.id,
      shopName_te: shop.name_te,
      shopName_en: shop.name_en,
      shopType: shop.type,
      status: 'placed' as OrderStatus,
      total: getCartTotal(),
      items: cart.map(item => ({
        productId: item.product.id,
        productName_te: item.product.name_te,
        productName_en: item.product.name_en,
        quantity: item.quantity,
        price: item.product.price,
      })),
      createdAt: new Date(),
      statusUpdatedAt: new Date(),
      customerNote: note,
      customerAddressText: 'Near Temple, Metlachittapur',
      deliveryFee: 20,
      // Snapshot coordinates
      pickupLatSnapshot: pickupLat,
      pickupLngSnapshot: pickupLng,
      dropLatSnapshot: METLACHITTAPUR_COORDS.lat,
      dropLngSnapshot: METLACHITTAPUR_COORDS.lng,
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    return newOrder;
  }, [user, cart, getCartTotal, clearCart]);

  const getOrderById = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const getOrdersByShopIds = useCallback((shopIds: string[]) => {
    return orders.filter(order => shopIds.includes(order.shopId));
  }, [orders]);

  // Get all orders with status 'ready' that are not assigned to any delivery partner
  const getReadyOrders = useCallback(() => {
    return orders.filter(order => order.status === 'ready' && !order.deliveryPartnerId);
  }, [orders]);

  // Get orders assigned to a specific delivery partner
  const getDeliveryPartnerOrders = useCallback((deliveryPartnerId: string) => {
    return orders.filter(order => order.deliveryPartnerId === deliveryPartnerId);
  }, [orders]);

  const updateOrderStatus = useCallback((
    orderId: string, 
    status: OrderStatus, 
    rejectionReason_te?: string, 
    rejectionReason_en?: string
  ) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        
        const updates: Partial<Order> = {
          status,
          statusUpdatedAt: new Date(),
          rejectionReason_te,
          rejectionReason_en,
        };

        // Set timeline timestamps based on status
        if (status === 'accepted') {
          updates.acceptedAt = new Date();
        } else if (status === 'ready') {
          updates.readyAt = new Date();
        }

        return { ...order, ...updates };
      })
    );
  }, []);

  // Delivery partner accepts an order
  const acceptDelivery = useCallback((orderId: string, deliveryPartnerId: string, deliveryPartnerName: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: 'assigned' as OrderStatus,
              deliveryPartnerId,
              deliveryPartnerName,
              assignedAt: new Date(),
              statusUpdatedAt: new Date(),
            }
          : order
      )
    );
  }, []);

  // Update delivery status
  const updateDeliveryStatus = useCallback((orderId: string, status: 'pickedUp' | 'onTheWay' | 'delivered') => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        
        const updates: Partial<Order> = {
          status,
          statusUpdatedAt: new Date(),
        };

        if (status === 'pickedUp') {
          updates.pickedUpAt = new Date();
        } else if (status === 'onTheWay') {
          updates.onTheWayAt = new Date();
        } else if (status === 'delivered') {
          updates.deliveredAt = new Date();
        }

        return { ...order, ...updates };
      })
    );
  }, []);

  // Location tracking
  const updateLocation = useCallback((orderId: string, lat: number, lng: number) => {
    if (!user) return;
    
    const newUpdate: LocationUpdate = {
      orderId,
      deliveryPartnerId: user.id,
      lat,
      lng,
      createdAt: new Date(),
    };
    
    setLocationUpdates(prev => [...prev, newUpdate]);
  }, [user]);

  const getLatestLocation = useCallback((orderId: string) => {
    const orderUpdates = locationUpdates.filter(u => u.orderId === orderId);
    return orderUpdates.length > 0 ? orderUpdates[orderUpdates.length - 1] : undefined;
  }, [locationUpdates]);

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    isMerchant: user?.role === 'merchant',
    isDelivery: user?.role === 'delivery',
    login,
    logout,
    updateUserName,
    updateUserAvailability,
    acknowledgeInsurance,
    cart,
    cartShopId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    orders,
    placeOrder,
    getOrderById,
    getOrdersByShopIds,
    getReadyOrders,
    getDeliveryPartnerOrders,
    updateOrderStatus,
    acceptDelivery,
    updateDeliveryStatus,
    locationUpdates,
    updateLocation,
    getLatestLocation,
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
