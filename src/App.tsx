import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AddressProvider } from "@/context/AddressContext";
import { UserModeProvider } from "@/context/UserModeContext";
import { useAuth } from "@/context/AuthContext";
import { getRouteForRoleSync } from "@/context/auth/postAuthRedirect";
import { useMerchantShopCheck } from "@/hooks/useMerchantShopCheck";
import Index from "./pages/Index";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { CategoryListingPage } from "./pages/CategoryListingPage";
import { ShopListingPage } from "./pages/ShopListingPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
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
import { DeliveryPendingPage } from "./pages/DeliveryPendingPage";
import { ApplyPage } from "./pages/ApplyPage";
import { LoginSuccessPage } from "./pages/LoginSuccessPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminOnboardingPage } from "./pages/admin/AdminOnboardingPage";
import { AdminShopsPage } from "./pages/admin/AdminShopsPage";
import { AdminFeesPage } from "./pages/admin/AdminFeesPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminProfilePage } from "./pages/admin/AdminProfilePage";

import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

/** Auth guard: redirects unauthenticated users to /login */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Login route guard: redirects authenticated users to /home */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

/** Customer-only routes */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && role !== "customer") return <Navigate to={getRouteForRoleSync(role)} replace />;
  return <>{children}</>;
}

/** Admin-only routes */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/home" replace />;
  return <>{children}</>;
}

/** Merchant routes requiring approved onboarding */
function MerchantRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "merchant" && role !== "admin") return <Navigate to="/home" replace />;
  if (role === "merchant") {
    if (!onboardingStatus) return <Navigate to="/apply" replace />;
    if (onboardingStatus === "pending" || onboardingStatus === "rejected") return <Navigate to="/merchant/pending" replace />;
  }
  return <>{children}</>;
}

/** Merchant routes requiring approved onboarding + shop */
function MerchantWithShopRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, isLoading } = useAuth();
  const { data: shopCheck, isLoading: shopCheckLoading } = useMerchantShopCheck(user?.id);
  if (isLoading || shopCheckLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "merchant" && role !== "admin") return <Navigate to="/home" replace />;
  if (role === "merchant") {
    if (!onboardingStatus) return <Navigate to="/apply" replace />;
    if (onboardingStatus === "pending" || onboardingStatus === "rejected") return <Navigate to="/merchant/pending" replace />;
    if (shopCheck && !shopCheck.hasShop) return <Navigate to="/merchant/setup" replace />;
  }
  return <>{children}</>;
}

/** Merchant pending page — only for merchants with pending/rejected applications */
function MerchantPendingRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "merchant") return <Navigate to="/home" replace />;
  if (onboardingStatus === "approved") return <Navigate to="/merchant/orders" replace />;
  if (!onboardingStatus) return <Navigate to="/apply" replace />;
  return <>{children}</>;
}

/** Delivery routes requiring approved onboarding */
function DeliveryRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "delivery" && role !== "admin") return <Navigate to="/home" replace />;
  if (role === "delivery") {
    if (!onboardingStatus) return <Navigate to="/apply" replace />;
    if (onboardingStatus === "pending" || onboardingStatus === "rejected") return <Navigate to="/delivery/pending" replace />;
  }
  return <>{children}</>;
}

/** Delivery pending page */
function DeliveryPendingRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "delivery") return <Navigate to="/home" replace />;
  if (onboardingStatus === "approved") return <Navigate to="/delivery/orders" replace />;
  if (!onboardingStatus) return <Navigate to="/apply" replace />;
  return <>{children}</>;
}

/** Apply page — for merchant/delivery without an application */
function ApplyRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role === "customer" || role === "admin") return <Navigate to={getRouteForRoleSync(role)} replace />;
  // If already has an application, go to pending page
  if (onboardingStatus) {
    return <Navigate to={role === "merchant" ? "/merchant/pending" : "/delivery/pending"} replace />;
  }
  return <>{children}</>;
}

const App = () => {
  const { isLoading } = useAuth(); // read-only auth state

  // Global auth loading gate: show spinner until session is resolved
  if (isLoading) {
    return (
      <TooltipProvider>
        <LoadingScreen />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <UserModeProvider>
            <AppProvider>
              <AddressProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                  <Route path="/login/success" element={<LoginSuccessPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/apply" element={<ApplyRoute><ApplyPage /></ApplyRoute>} />
                  <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path="/categories" element={<ProtectedRoute><CategoryListingPage /></ProtectedRoute>} />
                  <Route path="/shops" element={<ProtectedRoute><ShopListingPage /></ProtectedRoute>} />
                  <Route path="/shop/:shopId" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/basket" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
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
                  <Route path="/delivery/pending" element={<DeliveryPendingRoute><DeliveryPendingPage /></DeliveryPendingRoute>} />
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
              </AddressProvider>
            </AppProvider>
          </UserModeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
