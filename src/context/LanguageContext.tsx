import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'te' | 'en';

interface Translations {
  // Common
  appName: string;
  welcome: string;
  continue: string;
  skip: string;
  logout: string;
  testingMode: string;
  villageBadge: string;
  trustBadge: string;
  
  // Login
  enterMobileNumber: string;
  mobileNumber: string;
  
  // Home
  greeting: string;
  trustedShops: string;
  open: string;
  closed: string;
  
  // Shop
  addToCart: string;
  outOfStock: string;
  viewCart: string;
  items: string;
  
  // Cart
  yourOrder: string;
  paymentNote: string;
  placeOrder: string;
  emptyCartMessage: string;
  deliveryNote: string;
  total: string;
  
  // Order
  orderSuccess: string;
  orderSuccessMessage: string;
  deliveryMessage: string;
  orderId: string;
  goHome: string;
  
  // Orders
  myOrders: string;
  noOrders: string;
  orderDetails: string;
  orderTimeline: string;
  
  // Status
  statusPlaced: string;
  statusAccepted: string;
  statusReady: string;
  statusDelivered: string;
  
  // Profile
  myDetails: string;
  name: string;
  village: string;
  privacyNote: string;
  save: string;
  
  // Nav
  navHome: string;
  navOrders: string;
  navProfile: string;
}

const teluguTranslations: Translations = {
  // Common
  appName: 'మన అంగడి',
  welcome: 'మన అంగడికి స్వాగతం',
  continue: 'కొనసాగించండి',
  skip: 'దాటవేయండి',
  logout: 'లాగ్ అవుట్',
  testingMode: '🧪 టెస్టింగ్ మోడ్ - OTP అవసరం లేదు',
  villageBadge: '📍 Metlachittapur, Metpally',
  trustBadge: 'మన ఊరి నమ్మకమైన అంగడి',
  
  // Login
  enterMobileNumber: 'టెస్టింగ్ కోసం లాగిన్ చేయండి',
  mobileNumber: 'మొబైల్ నెంబర్',
  
  // Home
  greeting: 'నమస్తే 👋',
  trustedShops: 'మీ ఊరి నమ్మకమైన అంగడులు',
  open: 'తెరిచి ఉంది',
  closed: 'మూసి ఉంది',
  
  // Shop
  addToCart: 'కార్ట్‌లో వేయండి',
  outOfStock: 'లభ్యం కాదు',
  viewCart: 'కార్ట్ చూడండి',
  items: 'వస్తువులు',
  
  // Cart
  yourOrder: 'మీ ఆర్డర్ వివరాలు',
  paymentNote: 'చెల్లింపు: డెలివరీ సమయంలో',
  placeOrder: 'ఆర్డర్ పెట్టండి',
  emptyCartMessage: 'ముందుగా వస్తువులు జోడించండి',
  deliveryNote: 'డెలివరీ సూచనలు (ఐచ్ఛికం)',
  total: 'మొత్తం',
  
  // Order
  orderSuccess: 'ఆర్డర్ విజయవంతం!',
  orderSuccessMessage: 'మీ ఆర్డర్ విజయవంతంగా నమోదు అయ్యింది',
  deliveryMessage: 'మన ఊరి డెలివరీ వ్యక్తి త్వరలో వస్తారు',
  orderId: 'ఆర్డర్ ID',
  goHome: 'హోమ్‌కి వెళ్ళండి',
  
  // Orders
  myOrders: 'నా ఆర్డర్లు',
  noOrders: 'ఇంకా ఆర్డర్లు లేవు',
  orderDetails: 'ఆర్డర్ వివరాలు',
  orderTimeline: 'ఆర్డర్ స్థితి',
  
  // Status
  statusPlaced: 'నమోదు',
  statusAccepted: 'అంగీకరించారు',
  statusReady: 'సిద్ధం',
  statusDelivered: 'డెలివరీ అయ్యింది',
  
  // Profile
  myDetails: 'నా వివరాలు',
  name: 'పేరు',
  village: 'ఊరు',
  privacyNote: 'మీ ఆర్డర్ వివరాలు పూర్తిగా గోప్యంగా ఉంటాయి',
  save: 'సేవ్ చేయండి',
  
  // Nav
  navHome: 'అంగడులు',
  navOrders: 'ఆర్డర్లు',
  navProfile: 'నా వివరాలు',
};

const englishTranslations: Translations = {
  // Common
  appName: 'Mana Angadi',
  welcome: 'Welcome to Mana Angadi',
  continue: 'Continue',
  skip: 'Skip',
  logout: 'Logout',
  testingMode: '🧪 Testing Mode - No OTP required',
  villageBadge: '📍 Metlachittapur, Metpally',
  trustBadge: 'Your trusted village shop',
  
  // Login
  enterMobileNumber: 'Login for testing',
  mobileNumber: 'Mobile Number',
  
  // Home
  greeting: 'Hello 👋',
  trustedShops: 'Your trusted village shops',
  open: 'Open',
  closed: 'Closed',
  
  // Shop
  addToCart: 'Add to Cart',
  outOfStock: 'Out of Stock',
  viewCart: 'View Cart',
  items: 'items',
  
  // Cart
  yourOrder: 'Your Order Details',
  paymentNote: 'Payment: Cash on Delivery',
  placeOrder: 'Place Order',
  emptyCartMessage: 'Add items first',
  deliveryNote: 'Delivery instructions (optional)',
  total: 'Total',
  
  // Order
  orderSuccess: 'Order Successful!',
  orderSuccessMessage: 'Your order has been placed successfully',
  deliveryMessage: 'Our village delivery person will arrive soon',
  orderId: 'Order ID',
  goHome: 'Go to Home',
  
  // Orders
  myOrders: 'My Orders',
  noOrders: 'No orders yet',
  orderDetails: 'Order Details',
  orderTimeline: 'Order Status',
  
  // Status
  statusPlaced: 'Placed',
  statusAccepted: 'Accepted',
  statusReady: 'Ready',
  statusDelivered: 'Delivered',
  
  // Profile
  myDetails: 'My Details',
  name: 'Name',
  village: 'Village',
  privacyNote: 'Your order details are completely private',
  save: 'Save',
  
  // Nav
  navHome: 'Shops',
  navOrders: 'Orders',
  navProfile: 'Profile',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('mana-angadi-language');
    return (saved as Language) || 'te';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('mana-angadi-language', lang);
  };

  const t = language === 'te' ? teluguTranslations : englishTranslations;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
