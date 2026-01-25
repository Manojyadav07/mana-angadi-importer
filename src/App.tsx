import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AddressProvider } from "@/context/AddressContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { getRouteForRole } from "@/context/auth/authHelpers";
import { useMerchantShopCheck } from "@/hooks/useMerchantShopCheck";
import Index from "./pages/Index";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { CartPage } from "./pages/CartPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MerchantOrdersPage } from "./pages/MerchantOrdersPage";
import { MerchantProductsPage } from "./pages/MerchantProductsPage";
import { MerchantProfilePage } from "./pages/MerchantProfilePage";
import { MerchantShopSetupPage } from "./pages/MerchantShopSetupPage";
import { MerchantPendingPage } from "./pages/MerchantPendingPage";
import { DeliveryOnboardingPage } from "./pages/DeliveryOnboardingPage";
import { DeliveryOrdersPage } from "./pages/DeliveryOrdersPage";
import { DeliveryEarningsPage } from "./pages/DeliveryEarningsPage";
import { DeliveryProfilePage } from "./pages/DeliveryProfilePage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminOnboardingPage } from "./pages/admin/AdminOnboardingPage";
import { AdminShopsPage } from "./pages/admin/AdminShopsPage";
import { AdminFeesPage } from "./pages/admin/AdminFeesPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminProfilePage } from "./pages/admin/AdminProfilePage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, profile, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Customer-only pages: if a merchant/admin/delivery lands here (manual URL or stale route),
  // deterministically redirect to their role home.
  if (role && role !== 'customer') {
    return <Navigate to={getRouteForRole(role, profile?.merchant_status)} replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

function MerchantRoute({ children }: { children: React.ReactNode }) {
  const { user, role, profile, isLoading } = useAuth();
  const { data: shopCheck, isLoading: shopCheckLoading } = useMerchantShopCheck(user?.id);
  
  if (isLoading || shopCheckLoading) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (role !== 'merchant' && role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  // If merchant is pending approval, redirect to pending page
  if (role === 'merchant' && profile?.merchant_status === 'pending') {
    return <Navigate to="/merchant/pending" replace />;
  }

  // If merchant is rejected, also redirect to pending page (which shows rejection)
  if (role === 'merchant' && profile?.merchant_status === 'rejected') {
    return <Navigate to="/merchant/pending" replace />;
  }
  
  return <>{children}</>;
}

// Wrapper that redirects merchants without shops to setup
function MerchantWithShopRoute({ children }: { children: React.ReactNode }) {
  const { user, role, profile, isLoading } = useAuth();
  const { data: shopCheck, isLoading: shopCheckLoading } = useMerchantShopCheck(user?.id);
  
  if (isLoading || shopCheckLoading) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (role !== 'merchant' && role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  // If merchant is pending approval, redirect to pending page
  if (role === 'merchant' && profile?.merchant_status === 'pending') {
    return <Navigate to="/merchant/pending" replace />;
  }

  // If merchant is rejected, redirect to pending page
  if (role === 'merchant' && profile?.merchant_status === 'rejected') {
    return <Navigate to="/merchant/pending" replace />;
  }

  // If merchant has no shop, redirect to shop setup
  if (role === 'merchant' && shopCheck && !shopCheck.hasShop) {
    return <Navigate to="/merchant/setup" replace />;
  }
  
  return <>{children}</>;
}

// Route for pending merchants only
function MerchantPendingRoute({ children }: { children: React.ReactNode }) {
  const { user, role, profile, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (role !== 'merchant') {
    return <Navigate to="/home" replace />;
  }

  // If merchant is approved, redirect to orders
  if (profile?.merchant_status === 'approved' || profile?.merchant_status === null) {
    return <Navigate to="/merchant/orders" replace />;
  }
  
  return <>{children}</>;
}

function DeliveryRoute({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (role !== 'delivery' && role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/shop/:shopId" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      {/* Merchant Routes */}
      <Route path="/merchant/pending" element={<MerchantPendingRoute><MerchantPendingPage /></MerchantPendingRoute>} />
      <Route path="/merchant/setup" element={<MerchantRoute><MerchantShopSetupPage /></MerchantRoute>} />
      <Route path="/merchant/orders" element={<MerchantWithShopRoute><MerchantOrdersPage /></MerchantWithShopRoute>} />
      <Route path="/merchant/products" element={<MerchantWithShopRoute><MerchantProductsPage /></MerchantWithShopRoute>} />
      <Route path="/merchant/profile" element={<MerchantWithShopRoute><MerchantProfilePage /></MerchantWithShopRoute>} />
      {/* Delivery Partner Routes */}
      <Route path="/delivery/onboarding" element={<DeliveryRoute><DeliveryOnboardingPage /></DeliveryRoute>} />
      <Route path="/delivery/orders" element={<DeliveryRoute><DeliveryOrdersPage /></DeliveryRoute>} />
      <Route path="/delivery/earnings" element={<DeliveryRoute><DeliveryEarningsPage /></DeliveryRoute>} />
      <Route path="/delivery/profile" element={<DeliveryRoute><DeliveryProfilePage /></DeliveryRoute>} />
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/onboarding" element={<AdminRoute><AdminOnboardingPage /></AdminRoute>} />
      <Route path="/admin/shops" element={<AdminRoute><AdminShopsPage /></AdminRoute>} />
      <Route path="/admin/fees" element={<AdminRoute><AdminFeesPage /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
      <Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppProvider>
              <AddressProvider>
                <AppRoutes />
              </AddressProvider>
            </AppProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
