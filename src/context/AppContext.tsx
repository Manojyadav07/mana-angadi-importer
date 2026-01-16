import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, CartItem, Order, Product, OrderStatus } from '@/types';

interface AppContextType {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, name?: string) => void;
  logout: () => void;
  updateUserName: (name: string) => void;

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
  placeOrder: (shopId: string, shopName: string, note?: string) => Order;
  getOrderById: (orderId: string) => Order | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartShopId, setCartShopId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Auth functions
  const login = useCallback((phone: string, name?: string) => {
    setUser({
      id: `user_${Date.now()}`,
      name: name || '',
      phone,
      role: 'customer',
      village: 'Metlachittapur',
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

  // Cart functions
  const addToCart = useCallback((product: Product) => {
    // If adding from a different shop, clear cart first
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
  const placeOrder = useCallback((shopId: string, shopName: string, note?: string): Order => {
    const newOrder: Order = {
      id: `ORD${Date.now().toString().slice(-8)}`,
      customerId: user?.id || '',
      shopId,
      shopName,
      status: 'placed' as OrderStatus,
      total: getCartTotal(),
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      createdAt: new Date(),
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Simulate order status progression (for demo)
    setTimeout(() => {
      setOrders(prev =>
        prev.map(o => o.id === newOrder.id ? { ...o, status: 'accepted' as OrderStatus } : o)
      );
    }, 10000);

    setTimeout(() => {
      setOrders(prev =>
        prev.map(o => o.id === newOrder.id ? { ...o, status: 'ready' as OrderStatus } : o)
      );
    }, 20000);

    return newOrder;
  }, [user, cart, getCartTotal, clearCart]);

  const getOrderById = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUserName,
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
