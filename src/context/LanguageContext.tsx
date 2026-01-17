import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'te' | 'en';

interface Translations {
  // Common
  appName: string;
  welcome: string;
  welcomeMessage: string;
  welcomeSubMessage: string;
  okay: string;
  continue: string;
  skip: string;
  logout: string;
  testingMode: string;
  villageBadge: string;
  trustBadge: string;
  language: string;
  
  // Login
  enterMobileNumber: string;
  mobileNumber: string;
  sendOtp: string;
  invalidPhone: string;
  
  // Home
  greeting: string;
  nearbyShops: string;
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
  emptyCart: string;
  emptyCartMessage: string;
  deliveryNote: string;
  total: string;
  
  // Order
  orderSuccess: string;
  orderSuccessMessage: string;
  deliveryMessage: string;
  orderId: string;
  goHome: string;
  privacyOrderNote: string;
  
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
  noName: string;
  village: string;
  privacyNote: string;
  privacyGuarantee: string;
  save: string;
  
  // Nav
  navHome: string;
  navOrders: string;
  navProfile: string;
  
  // Errors
  networkError: string;
}

const teluguTranslations: Translations = {
  // Common
  appName: 'మన అంగడి',
  welcome: 'మన అంగడికి స్వాగతం',
  welcomeMessage: 'ఇది మన ఊరి కోసం తయారైన యాప్.',
  welcomeSubMessage: 'మీ ఆర్డర్ సురక్షితంగా, గోప్యంగా డెలివరీ అవుతుంది.',
  okay: 'సరే',
  continue: 'కొనసాగించండి',
  skip: 'దాటవేయండి',
  logout: 'లాగ్ అవుట్',
  testingMode: '🧪 టెస్టింగ్ మోడ్ - OTP అవసరం లేదు',
  villageBadge: '📍 Metlachittapur, Metpally',
  trustBadge: 'మన ఊరి నమ్మకమైన అంగడి',
  language: 'భాష',
  
  // Login
  enterMobileNumber: 'మీ నెంబర్ నమోదు చేయండి',
  mobileNumber: 'మొబైల్ నెంబర్',
  sendOtp: 'OTP పంపండి',
  invalidPhone: 'దయచేసి సరైన నెంబర్ నమోదు చేయండి',
  
  // Home
  greeting: 'నమస్తే 👋',
  nearbyShops: 'మీ ఊరి అంగడులు',
  trustedShops: 'మీ ఊరి నమ్మకమైన అంగడులు',
  open: 'తెరిచి ఉంది',
  closed: 'మూసి ఉంది',
  
  // Shop
  addToCart: 'కార్ట్‌లో వేసుకోండి',
  outOfStock: 'లభ్యం కాదు',
  viewCart: 'కార్ట్ చూడండి',
  items: 'వస్తువులు',
  
  // Cart
  yourOrder: 'మీ ఆర్డర్',
  paymentNote: 'చెల్లింపు: డెలివరీ సమయంలో',
  placeOrder: 'ఆర్డర్ పెట్టండి',
  emptyCart: 'మీ కార్ట్ ఖాళీగా ఉంది',
  emptyCartMessage: 'ముందుగా వస్తువులు జోడించండి',
  deliveryNote: 'డెలివరీ సూచనలు (ఐచ్ఛికం)',
  total: 'మొత్తం',
  
  // Order
  orderSuccess: 'ఆర్డర్ విజయవంతం!',
  orderSuccessMessage: 'మీ ఆర్డర్ సురక్షితంగా నమోదు అయ్యింది',
  deliveryMessage: 'త్వరలో మన డెలివరీ వ్యక్తి ప్రారంభిస్తారు',
  orderId: 'ఆర్డర్ ID',
  goHome: 'హోమ్‌కి వెళ్ళండి',
  privacyOrderNote: 'మీ ఆర్డర్ వివరాలు గోప్యంగా ఉంటాయి',
  
  // Orders
  myOrders: 'నా ఆర్డర్లు',
  noOrders: 'ఇప్పటికీ ఆర్డర్లు లేవు',
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
  noName: 'పేరు లేదు',
  village: 'ఊరు',
  privacyNote: 'మీ ఆర్డర్ వివరాలు పూర్తిగా గోప్యంగా ఉంటాయి',
  privacyGuarantee: 'గోప్యత హామీ',
  save: 'సేవ్ చేయండి',
  
  // Nav
  navHome: 'అంగడులు',
  navOrders: 'ఆర్డర్లు',
  navProfile: 'నా వివరాలు',
  
  // Errors
  networkError: 'ఇంటర్నెట్ సమస్య కనిపిస్తోంది',
};

const englishTranslations: Translations = {
  // Common
  appName: 'Mana Angadi',
  welcome: 'Welcome to Mana Angadi',
  welcomeMessage: 'This app is made for our village.',
  welcomeSubMessage: 'Your orders will be delivered safely and privately.',
  okay: 'Okay',
  continue: 'Continue',
  skip: 'Skip',
  logout: 'Logout',
  testingMode: '🧪 Testing Mode - No OTP required',
  villageBadge: '📍 Metlachittapur, Metpally',
  trustBadge: 'Your trusted village shop',
  language: 'Language',
  
  // Login
  enterMobileNumber: 'Enter your mobile number',
  mobileNumber: 'Mobile Number',
  sendOtp: 'Send OTP',
  invalidPhone: 'Please enter a valid mobile number',
  
  // Home
  greeting: 'Hello 👋',
  nearbyShops: 'Nearby Shops',
  trustedShops: 'Your trusted village shops',
  open: 'Open',
  closed: 'Closed',
  
  // Shop
  addToCart: 'Add to Cart',
  outOfStock: 'Out of Stock',
  viewCart: 'View Cart',
  items: 'items',
  
  // Cart
  yourOrder: 'Your Order',
  paymentNote: 'Payment: Cash on Delivery',
  placeOrder: 'Place Order',
  emptyCart: 'Your cart is empty',
  emptyCartMessage: 'Add items first',
  deliveryNote: 'Delivery instructions (optional)',
  total: 'Total',
  
  // Order
  orderSuccess: 'Order Successful!',
  orderSuccessMessage: 'Your order has been placed safely',
  deliveryMessage: 'A local delivery person will start shortly',
  orderId: 'Order ID',
  goHome: 'Go to Home',
  privacyOrderNote: 'Your order details are kept private',
  
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
  noName: 'No name',
  village: 'Village',
  privacyNote: 'Your order details are completely private',
  privacyGuarantee: 'Privacy Guarantee',
  save: 'Save',
  
  // Nav
  navHome: 'Home',
  navOrders: 'Orders',
  navProfile: 'Profile',
  
  // Errors
  networkError: 'Network issue detected',
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
