// src/App.tsx
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AddressProvider } from "@/context/AddressContext";
import { UserModeProvider } from "@/context/UserModeContext";
import { CartProvider } from "@/context/CartContext";
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
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
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
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

// ── Guards ──────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
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

// Customer pages — redirects non-customers to their own dashboard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const roles: string[] = (profile as any)?.roles ?? [];
  if (roles.includes("admin")) return <Navigate to="/admin/dashboard" replace />;
  if (roles.includes("merchant")) return <Navigate to="/merchant/dashboard" replace />;
  if (roles.includes("delivery")) return <Navigate to="/delivery/dashboard" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const roles: string[] = (profile as any)?.roles ?? [];
  if (!roles.includes("admin")) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function MerchantRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const roles: string[] = (profile as any)?.roles ?? [];
  if (!roles.includes("merchant")) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function MerchantWithShopRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, authReady } = useAuth();
  const { data, isLoading } = useMerchantShopCheck(user?.id ?? "");
  const hasShop = data?.hasShop ?? false;

  if (!authReady || isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const roles: string[] = (profile as any)?.roles ?? [];
  if (!roles.includes("merchant")) return <Navigate to="/home" replace />;
  if (!hasShop) return <Navigate to="/merchant/setup" replace />;
  return <>{children}</>;
}

function MerchantPendingRoute({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function DeliveryRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  const roles: string[] = (profile as any)?.roles ?? [];
  if (!roles.includes("delivery")) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

// ── Root redirect based on role ─────────────────────────────────
function RootRedirect() {
  const { user, profile, authReady } = useAuth();
  if (!authReady) return <LoadingScreen />;
  if (!user) return <Navigate to="/welcome" replace />;
  const roles: string[] = (profile as any)?.roles ?? [];
  if (roles.includes("admin"))    return <Navigate to="/admin/dashboard" replace />;
  if (roles.includes("merchant")) return <Navigate to="/merchant/dashboard" replace />;
  if (roles.includes("delivery")) return <Navigate to="/delivery/dashboard" replace />;
  return <Navigate to="/home" replace />;
}

// ── App ─────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <LanguageProvider>
      <UserModeProvider>
        <CartProvider>
          <AppProvider>
            <AddressProvider>
              <Routes>
                {/* Root */}
                <Route path="/" element={<RootRedirect />} />

                {/* Public */}
                <Route path="/welcome"          element={<WelcomePage />} />
                <Route path="/login"            element={<LoginPage />} />
                <Route path="/auth"             element={<LoginPage />} />
                <Route path="/signup"           element={<SignupPage />} />
                <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
                <Route path="/reset-password"   element={<ResetPasswordPage />} />
                <Route path="/shop/preview/:shopId" element={<PublicShopPage />} />

                {/* Customer */}
                <Route path="/home"         element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/shop/:shopId" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
                <Route path="/cart"         element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/basket"       element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/checkout"     element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                <Route path="/orders"       element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                {/* Merchant Application */}
                <Route path="/merchant/apply"              element={<AuthGuard><MerchantApplicationPage /></AuthGuard>} />
                <Route path="/merchant/application-status" element={<AuthGuard><MerchantApplicationStatusPage /></AuthGuard>} />
                <Route path="/merchant/pending"            element={<MerchantPendingRoute><MerchantPendingPage /></MerchantPendingRoute>} />
                <Route path="/merchant/setup"              element={<MerchantRoute><MerchantShopSetupPage /></MerchantRoute>} />

                {/* Merchant Dashboard */}
                <Route path="/merchant"           element={<Navigate to="/merchant/dashboard" replace />} />
                <Route path="/merchant/dashboard" element={<MerchantWithShopRoute><MerchantDashboardPage /></MerchantWithShopRoute>} />
                <Route path="/merchant/orders"    element={<MerchantWithShopRoute><MerchantOrdersPage /></MerchantWithShopRoute>} />
                <Route path="/merchant/products"  element={<MerchantWithShopRoute><MerchantProductsPage /></MerchantWithShopRoute>} />
                <Route path="/merchant/earnings"  element={<MerchantWithShopRoute><MerchantEarningsPage /></MerchantWithShopRoute>} />
                <Route path="/merchant/profile"   element={<MerchantWithShopRoute><MerchantProfilePage /></MerchantWithShopRoute>} />
                <Route path="/merchant/store"     element={<Navigate to="/merchant/profile" replace />} />
                <Route path="/merchant/more"      element={<Navigate to="/merchant/profile" replace />} />

                {/* Delivery */}
                <Route path="/delivery/onboarding" element={<AuthGuard><DeliveryOnboardingPage /></AuthGuard>} />
                <Route path="/delivery/pending"    element={<AuthGuard><DeliveryPendingPage /></AuthGuard>} />
                <Route path="/delivery"            element={<Navigate to="/delivery/dashboard" replace />} />
                <Route path="/delivery/dashboard"  element={<DeliveryRoute><DeliveryOrdersPage /></DeliveryRoute>} />
                <Route path="/delivery/orders"     element={<Navigate to="/delivery/dashboard" replace />} />
                <Route path="/delivery/earnings"   element={<DeliveryRoute><DeliveryEarningsPage /></DeliveryRoute>} />
                <Route path="/delivery/profile"    element={<DeliveryRoute><DeliveryProfilePage /></DeliveryRoute>} />

                {/* Admin */}
                <Route path="/admin"                    element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard"          element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/onboarding"         element={<AdminRoute><AdminOnboardingPage /></AdminRoute>} />
                <Route path="/admin/shops"              element={<AdminRoute><AdminShopsPage /></AdminRoute>} />
                <Route path="/admin/fees"               element={<AdminRoute><AdminFeesPage /></AdminRoute>} />
                <Route path="/admin/orders"             element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
                <Route path="/admin/profile"            element={<AdminRoute><AdminProfilePage /></AdminRoute>} />
                <Route path="/admin/merchants"          element={<AdminRoute><AdminMerchantsPage /></AdminRoute>} />
                <Route path="/admin/delivery-partners"  element={<AdminRoute><AdminDeliveryPartnersPage /></AdminRoute>} />
                <Route path="/admin/customers"          element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
                <Route path="/admin/settlements"        element={<AdminRoute><AdminSettlementsPage /></AdminRoute>} />
                <Route path="/admin/villages"           element={<AdminRoute><AdminVillagesPage /></AdminRoute>} />
                <Route path="/admin/more"               element={<AdminRoute><div /></AdminRoute>} />

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