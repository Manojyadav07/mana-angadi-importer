import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AddressProvider } from "@/context/AddressContext";
import { CartProvider } from "@/context/CartContext";
import { UserModeProvider } from "@/context/UserModeContext";
import { useAuth } from "@/context/AuthContext";
import { getRouteForRoleSync } from "@/context/auth/postAuthRedirect";
import { useMerchantShopCheck } from "@/hooks/useMerchantShopCheck";
import { WelcomePage } from "./pages/WelcomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { PublicShopPage } from "./pages/PublicShopPage";
import { CategoryListingPage } from "./pages/CategoryListingPage";
import { CategoryShopsPage } from "./pages/CategoryShopsPage";
import { ShopListingPage } from "./pages/ShopListingPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { MerchantDashboardPage } from "./pages/MerchantDashboardPage";
import { MerchantOrdersPage } from "./pages/MerchantOrdersPage";
import { MerchantProductsPage } from "./pages/MerchantProductsPage";
import { MerchantProfilePage } from "./pages/MerchantProfilePage";
import { MerchantEarningsPage } from "./pages/MerchantEarningsPage";
import { MerchantShopSetupPage } from "./pages/MerchantShopSetupPage";
import { MerchantPendingPage } from "./pages/MerchantPendingPage";
import { MerchantApplicationPage } from "./pages/MerchantApplicationPage";
import { MerchantApplicationStatusPage } from "./pages/MerchantApplicationStatusPage";
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
import { AdminMerchantsPage } from "./pages/admin/AdminMerchantsPage";
import { AdminDeliveryPartnersPage } from "./pages/admin/AdminDeliveryPartnersPage";
import { AdminCustomersPage } from "./pages/admin/AdminCustomersPage";
import { AdminSettlementsPage } from "./pages/admin/AdminSettlementsPage";
import { AdminVillagesPage } from "./pages/admin/AdminVillagesPage";
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

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && role !== "customer") return <Navigate to={getRouteForRoleSync(role)} replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function MerchantRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "merchant" && role !== "admin") return <Navigate to="/home" replace />;
  if (role === "merchant") {
    if (onboardingStatus === "pending" || onboardingStatus === "rejected")
      return <Navigate to="/merchant/pending" replace />;
  }
  return <>{children}</>;
}

function MerchantWithShopRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, authReady } = useAuth();
  const { isLoading: shopCheckLoading } = useMerchantShopCheck(user?.id);
  if (!authReady || shopCheckLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "merchant" && role !== "admin") return <Navigate to="/home" replace />;
  if (role === "merchant") {
    if (onboardingStatus === "pending" || onboardingStatus === "rejected")
      return <Navigate to="/merchant/pending" replace />;
  }
  return <>{children}</>;
}

function MerchantPendingRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "merchant") return <Navigate to="/home" replace />;
  if (!onboardingStatus || onboardingStatus === "approved")
    return <Navigate to="/merchant/dashboard" replace />;
  return <>{children}</>;
}

function DeliveryRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "delivery" && role !== "admin") return <Navigate to="/home" replace />;
  if (role === "delivery") {
    if (onboardingStatus === "pending" || onboardingStatus === "rejected")
      return <Navigate to="/delivery/pending" replace />;
  }
  return <>{children}</>;
}

function DeliveryPendingRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "delivery") return <Navigate to="/home" replace />;
  if (!onboardingStatus || onboardingStatus === "approved")
    return <Navigate to="/delivery/dashboard" replace />;
  return <>{children}</>;
}

function ApplyRoute({ children }: { children: React.ReactNode }) {
  const { user, role, onboardingStatus, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "merchant") return <Navigate to="/merchant/dashboard" replace />;
  if (role === "delivery") return <Navigate to="/delivery/dashboard" replace />;
  if (onboardingStatus) return <Navigate to="/delivery/pending" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <LanguageProvider>
      <UserModeProvider>
        <CartProvider>
          <AppProvider>
            <AddressProvider>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Navigate to="/welcome" replace />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/login/success" element={<AuthGuard><LoginSuccessPage /></AuthGuard>} />

                {/* Apply */}
                <Route path="/apply" element={<ApplyRoute><ApplyPage /></ApplyRoute>} />

                {/* Customer */}
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoryListingPage /></ProtectedRoute>} />
                <Route path="/shops" element={<ProtectedRoute><ShopListingPage /></ProtectedRoute>} />
                <Route path="/category/:categoryKey" element={<ProtectedRoute><CategoryShopsPage /></ProtectedRoute>} />
                <Route path="/shop/:shopId" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/basket" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

                {/* Merchant Application */}
                <Route path="/merchant/apply" element={<AuthGuard><MerchantApplicationPage /></AuthGuard>} />
                <Route path="/merchant/application-status" element={<AuthGuard><MerchantApplicationStatusPage /></AuthGuard>} />
                <Route path="/merchant/pending" element={<MerchantPendingRoute><MerchantPendingPage /></MerchantPendingRoute>} />
                <Route path="/merchant/setup" element={<MerchantRoute><MerchantShopSetupPage /></MerchantRoute>} />

                {/* Merchant Dashboard */}
                <Route path="/merchant/dashboard" element={<MerchantWithShopRoute><MerchantDashboardPage /></MerchantWithShopRoute>} />

                {/* Merchant Main Screens */}
                <Route path="/merchant/orders"   element={<MerchantWithShopRoute><MerchantOrdersPage   /></MerchantWithShopRoute>} />
                <Route path="/merchant/products" element={<MerchantWithShopRoute><MerchantProductsPage /></MerchantWithShopRoute>} />
                <Route path="/merchant/earnings" element={<MerchantWithShopRoute><MerchantEarningsPage /></MerchantWithShopRoute>} />
                <Route path="/merchant/profile"  element={<MerchantWithShopRoute><MerchantProfilePage  /></MerchantWithShopRoute>} />
                <Route path="/merchant/store" element={<Navigate to="/merchant/profile" replace />} />
                <Route path="/merchant/more"  element={<Navigate to="/merchant/profile" replace />} />

                {/* Delivery */}
                <Route path="/delivery/pending" element={<DeliveryPendingRoute><DeliveryPendingPage /></DeliveryPendingRoute>} />
                <Route path="/delivery/onboarding" element={<DeliveryRoute><DeliveryOnboardingPage /></DeliveryRoute>} />
                <Route path="/delivery/dashboard" element={<DeliveryRoute><DeliveryOrdersPage /></DeliveryRoute>} />
                <Route path="/delivery/orders" element={<Navigate to="/delivery/dashboard" replace />} />
                <Route path="/delivery/earnings" element={<DeliveryRoute><DeliveryEarningsPage /></DeliveryRoute>} />
                <Route path="/delivery/profile" element={<DeliveryRoute><DeliveryProfilePage /></DeliveryRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/onboarding" element={<AdminRoute><AdminOnboardingPage /></AdminRoute>} />
                <Route path="/admin/shops" element={<AdminRoute><AdminShopsPage /></AdminRoute>} />
                <Route path="/admin/fees" element={<AdminRoute><AdminFeesPage /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
                <Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute>} />
                <Route path="/admin/merchants" element={<AdminRoute><AdminMerchantsPage /></AdminRoute>} />
                <Route path="/admin/delivery-partners" element={<AdminRoute><AdminDeliveryPartnersPage /></AdminRoute>} />
                <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
                <Route path="/admin/settlements" element={<AdminRoute><AdminSettlementsPage /></AdminRoute>} />
                <Route path="/admin/villages" element={<AdminRoute><AdminVillagesPage /></AdminRoute>} />
                <Route path="/admin/more" element={<AdminRoute><div /></AdminRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AddressProvider>
          </AppProvider>
        </CartProvider>
      </UserModeProvider>
    </LanguageProvider>
  );
}

const App = () => (
  <TooltipProvider>
    <AppRoutes />
  </TooltipProvider>
);

export default App;