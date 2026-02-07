import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";
import type { OnboardingStatus } from "./authHelpers";

const sb = supabase as any;

/**
 * Get user_mode from localStorage (default: "customer").
 */
function getUserMode(): string {
  return localStorage.getItem("mana-angadi-user-mode") || "customer";
}

/**
 * Single source of truth for post-auth navigation.
 * Routes based on user_mode (localStorage), NOT the DB role.
 * Admin dashboard is only reached via explicit mode switch.
 */
export async function postAuthRedirect(
  maxRetries = 2
): Promise<{ route: string; error?: string }> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.user) {
    return { route: "/login", error: sessionError?.message };
  }

  const userId = sessionData.session.user.id;

  // Check if user has any role at all
  let role: UserRole | null = null;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    const roleResult = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
    if (roleResult.data?.role) {
      role = roleResult.data.role as UserRole;
      break;
    }
    retryCount++;
    if (retryCount <= maxRetries) await new Promise(r => setTimeout(r, 500));
  }

  if (!role) return { route: "/choose-role" };

  // Route based on user_mode from localStorage
  const mode = getUserMode();

  if (mode === "admin" && role === "admin") {
    return { route: "/admin/dashboard" };
  }

  if (mode === "merchant") {
    // Must be merchant or admin role with approved onboarding
    if (role === "merchant" || role === "admin") {
      if (role === "merchant") {
        const { data: application } = await sb
          .from("onboarding_applications")
          .select("status")
          .eq("user_id", userId)
          .maybeSingle();
        const status = (application?.status as OnboardingStatus) ?? null;
        if (!status) return { route: "/apply" };
        if (status === "pending" || status === "rejected") return { route: "/merchant/pending" };
        // Approved - check shop
        const { data: shops } = await supabase.from("shops").select("id").eq("owner_id", userId).limit(1);
        if (!shops || shops.length === 0) return { route: "/merchant/setup" };
        return { route: "/merchant/orders" };
      }
      return { route: "/merchant/orders" };
    }
    // Not a merchant, fall through to customer
  }

  if (mode === "delivery") {
    if (role === "delivery" || role === "admin") {
      if (role === "delivery") {
        const { data: application } = await sb
          .from("onboarding_applications")
          .select("status")
          .eq("user_id", userId)
          .maybeSingle();
        const status = (application?.status as OnboardingStatus) ?? null;
        if (!status) return { route: "/apply" };
        if (status === "pending" || status === "rejected") return { route: "/delivery/pending" };
        return { route: "/delivery/orders" };
      }
      return { route: "/delivery/orders" };
    }
  }

  // Default: customer mode
  return { route: "/home" };
}

/**
 * Synchronous version — always returns customer home.
 * For mode-based routing, use postAuthRedirect() instead.
 */
export function getRouteForRoleSync(
  role: UserRole | null,
  onboardingStatus?: OnboardingStatus,
  hasShop?: boolean
): string {
  const mode = getUserMode();

  if (!role) return "/choose-role";

  if (mode === "admin" && role === "admin") return "/admin/dashboard";

  if (mode === "merchant" && (role === "merchant" || role === "admin")) {
    if (role === "merchant") {
      if (!onboardingStatus) return "/apply";
      if (onboardingStatus === "pending" || onboardingStatus === "rejected") return "/merchant/pending";
      if (hasShop === false) return "/merchant/setup";
    }
    return "/merchant/orders";
  }

  if (mode === "delivery" && (role === "delivery" || role === "admin")) {
    if (role === "delivery") {
      if (!onboardingStatus) return "/apply";
      if (onboardingStatus === "pending" || onboardingStatus === "rejected") return "/delivery/pending";
    }
    return "/delivery/orders";
  }

  return "/home";
}
