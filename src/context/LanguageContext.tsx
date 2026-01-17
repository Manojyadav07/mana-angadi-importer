import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'te' | 'en';

interface Translations {
  // Common
  appName: string;
  welcome: string;
  welcomeMessage: string;
  welcomeSubMessage: string;
  chooseLanguageFirst: string;
  okay: string;
  continue: string;
  skip: string;
  logout: string;
  testingMode: string;
  villageBadge: string;
  trustBadge: string;
  trustedLocalShop: string;
  language: string;
  shopNotFound: string;
  orderNotFound: string;
  currentStatus: string;
  cancel: string;
  confirm: string;
  back: string;
  
  // Login
  enterMobileNumber: string;
  mobileNumber: string;
  sendOtp: string;
  invalidPhone: string;
  merchantLogin: string;
  customerLogin: string;
  loginAs: string;
  
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
  shopClosed: string;
  
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
  browseShops: string;
  viewOrderStatus: string;
  
  // Status
  statusPlaced: string;
  statusAccepted: string;
  statusReady: string;
  statusDelivered: string;
  statusRejected: string;
  
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
  navProducts: string;
  
  // Errors
  networkError: string;
  
  // Merchant
  merchantMode: string;
  shopStatus: string;
  shopOpenLabel: string;
  shopClosedLabel: string;
  myShops: string;
  incomingOrders: string;
  allOrders: string;
  newOrders: string;
  acceptedOrders: string;
  readyOrders: string;
  deliveredOrders: string;
  acceptOrder: string;
  rejectOrder: string;
  markReady: string;
  orderAccepted: string;
  orderRejected: string;
  orderMarkedReady: string;
  selectRejectionReason: string;
  itemsNotAvailable: string;
  shopClosedReason: string;
  cannotFulfillNow: string;
  
  // Merchant Products
  myProducts: string;
  addProduct: string;
  editProduct: string;
  productName: string;
  productNameTe: string;
  productNameEn: string;
  price: string;
  inStock: string;
  active: string;
  category: string;
  noProducts: string;
  saveProduct: string;
  deleteProduct: string;
  productSaved: string;
  
  // Filter chips
  all: string;
  new: string;
}

const teluguTranslations: Translations = {
  // Common
  appName: 'మన అంగడి',
  welcome: 'మన అంగడికి స్వాగతం',
  welcomeMessage: 'ఇది మన ఊరి కోసం తయారైన యాప్.',
  welcomeSubMessage: 'మీ ఆర్డర్ సురక్షితంగా, గోప్యంగా డెలివరీ అవుతుంది.',
  chooseLanguageFirst: 'ముందుగా మీ భాష ఎంచుకోండి',
  okay: 'సరే',
  continue: 'కొనసాగించండి',
  skip: 'దాటవేయండి',
  logout: 'లాగ్ అవుట్',
  testingMode: '🧪 టెస్టింగ్ మోడ్ - OTP అవసరం లేదు',
  villageBadge: '📍 Metlachittapur, Metpally',
  trustBadge: 'మన ఊరి నమ్మకమైన అంగడి',
  trustedLocalShop: 'మన ఊరి నమ్మకమైన అంగడి',
  language: 'భాష',
  shopNotFound: 'అంగడి కనుగొనబడలేదు',
  orderNotFound: 'ఆర్డర్ కనుగొనబడలేదు',
  currentStatus: 'ప్రస్తుత స్థితి',
  cancel: 'రద్దు చేయండి',
  confirm: 'నిర్ధారించండి',
  back: 'వెనుకకు',
  
  // Login
  enterMobileNumber: 'మీ నెంబర్ నమోదు చేయండి',
  mobileNumber: 'మొబైల్ నెంబర్',
  sendOtp: 'OTP పంపండి',
  invalidPhone: 'దయచేసి సరైన నెంబర్ నమోదు చేయండి',
  merchantLogin: 'వ్యాపారి లాగిన్',
  customerLogin: 'కస్టమర్ లాగిన్',
  loginAs: 'లాగిన్ చేయండి',
  
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
  shopClosed: 'అంగడి మూసి ఉంది',
  
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
  browseShops: 'అంగడులు చూడండి',
  viewOrderStatus: 'మీ ఆర్డర్ స్థితి ఇక్కడ చూడండి',
  
  // Status - exact translations from spec
  statusPlaced: 'నమోదయ్యింది',
  statusAccepted: 'అంగీకరించారు',
  statusReady: 'సిద్ధం',
  statusDelivered: 'డెలివరీ అయింది',
  statusRejected: 'తిరస్కరించబడింది',
  
  // Profile
  myDetails: 'నా వివరాలు',
  name: 'పేరు',
  noName: 'పేరు లేదు',
  village: 'ఊరు',
  privacyNote: 'మీ ఆర్డర్ వివరాలు పూర్తిగా గోప్యంగా ఉంటాయి',
  privacyGuarantee: 'గోప్యత హామీ',
  save: 'సేవ్ చేయండి',
  
  // Nav - exact translations from spec
  navHome: 'హోమ్',
  navOrders: 'ఆర్డర్లు',
  navProfile: 'ప్రొఫైల్',
  navProducts: 'ఉత్పత్తులు',
  
  // Errors
  networkError: 'ఇంటర్నెట్ సమస్య కనిపిస్తోంది',
  
  // Merchant
  merchantMode: 'వ్యాపారి మోడ్',
  shopStatus: 'దుకాణం స్థితి',
  shopOpenLabel: 'దుకాణం: తెరిచి ఉంది',
  shopClosedLabel: 'దుకాణం: మూసి ఉంది',
  myShops: 'నా దుకాణాలు',
  incomingOrders: 'ఇన్కమింగ్ ఆర్డర్లు',
  allOrders: 'అన్ని ఆర్డర్లు',
  newOrders: 'కొత్త ఆర్డర్లు',
  acceptedOrders: 'అంగీకరించిన ఆర్డర్లు',
  readyOrders: 'సిద్ధమైన ఆర్డర్లు',
  deliveredOrders: 'డెలివరీ అయిన ఆర్డర్లు',
  acceptOrder: 'అంగీకరించండి',
  rejectOrder: 'తిరస్కరించండి',
  markReady: 'సిద్ధం అని మార్క్ చేయండి',
  orderAccepted: 'ఆర్డర్ అంగీకరించబడింది',
  orderRejected: 'ఆర్డర్ తిరస్కరించబడింది',
  orderMarkedReady: 'ఆర్డర్ సిద్ధంగా ఉంది',
  selectRejectionReason: 'తిరస్కరణ కారణం ఎంచుకోండి',
  itemsNotAvailable: 'వస్తువులు అందుబాటులో లేవు',
  shopClosedReason: 'దుకాణం మూసి ఉంది',
  cannotFulfillNow: 'ఇప్పుడు నెరవేర్చలేము',
  
  // Merchant Products
  myProducts: 'నా ఉత్పత్తులు',
  addProduct: 'ఉత్పత్తి జోడించండి',
  editProduct: 'ఉత్పత్తి సవరించండి',
  productName: 'ఉత్పత్తి పేరు',
  productNameTe: 'తెలుగు పేరు',
  productNameEn: 'ఆంగ్ల పేరు',
  price: 'ధర',
  inStock: 'స్టాక్‌లో ఉంది',
  active: 'యాక్టివ్',
  category: 'కేటగిరీ',
  noProducts: 'ఇంకా ఉత్పత్తులు లేవు',
  saveProduct: 'ఉత్పత్తిని సేవ్ చేయండి',
  deleteProduct: 'ఉత్పత్తిని తొలగించండి',
  productSaved: 'ఉత్పత్తి సేవ్ అయింది',
  
  // Filter chips
  all: 'అన్నీ',
  new: 'కొత్త',
};

const englishTranslations: Translations = {
  // Common
  appName: 'Mana Angadi',
  welcome: 'Welcome to Mana Angadi',
  welcomeMessage: 'This app is made for our village.',
  welcomeSubMessage: 'Your orders will be delivered safely and privately.',
  chooseLanguageFirst: 'Choose your language first',
  okay: 'Okay',
  continue: 'Continue',
  skip: 'Skip',
  logout: 'Logout',
  testingMode: '🧪 Testing Mode - No OTP required',
  villageBadge: '📍 Metlachittapur, Metpally',
  trustBadge: 'Trusted Local Shop',
  trustedLocalShop: 'Trusted Local Shop',
  language: 'Language',
  shopNotFound: 'Shop not found',
  orderNotFound: 'Order not found',
  currentStatus: 'Current Status',
  cancel: 'Cancel',
  confirm: 'Confirm',
  back: 'Back',
  
  // Login
  enterMobileNumber: 'Enter your mobile number',
  mobileNumber: 'Mobile Number',
  sendOtp: 'Send OTP',
  invalidPhone: 'Please enter a valid mobile number',
  merchantLogin: 'Merchant Login',
  customerLogin: 'Customer Login',
  loginAs: 'Login as',
  
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
  shopClosed: 'Shop is closed',
  
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
  browseShops: 'Browse Shops',
  viewOrderStatus: 'View your order status here',
  
  // Status
  statusPlaced: 'Placed',
  statusAccepted: 'Accepted',
  statusReady: 'Ready',
  statusDelivered: 'Delivered',
  statusRejected: 'Rejected',
  
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
  navProducts: 'Products',
  
  // Errors
  networkError: 'Network issue detected',
  
  // Merchant
  merchantMode: 'Merchant Mode',
  shopStatus: 'Shop Status',
  shopOpenLabel: 'Shop: Open',
  shopClosedLabel: 'Shop: Closed',
  myShops: 'My Shops',
  incomingOrders: 'Incoming Orders',
  allOrders: 'All Orders',
  newOrders: 'New Orders',
  acceptedOrders: 'Accepted',
  readyOrders: 'Ready',
  deliveredOrders: 'Delivered',
  acceptOrder: 'Accept',
  rejectOrder: 'Reject',
  markReady: 'Mark Ready',
  orderAccepted: 'Order accepted',
  orderRejected: 'Order rejected',
  orderMarkedReady: 'Order marked ready',
  selectRejectionReason: 'Select rejection reason',
  itemsNotAvailable: 'Items not available',
  shopClosedReason: 'Shop closed',
  cannotFulfillNow: 'Cannot fulfill now',
  
  // Merchant Products
  myProducts: 'My Products',
  addProduct: 'Add Product',
  editProduct: 'Edit Product',
  productName: 'Product Name',
  productNameTe: 'Telugu Name',
  productNameEn: 'English Name',
  price: 'Price',
  inStock: 'In Stock',
  active: 'Active',
  category: 'Category',
  noProducts: 'No products yet',
  saveProduct: 'Save Product',
  deleteProduct: 'Delete Product',
  productSaved: 'Product saved',
  
  // Filter chips
  all: 'All',
  new: 'New',
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
