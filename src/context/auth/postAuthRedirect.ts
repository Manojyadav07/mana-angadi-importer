import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";
import type { MerchantStatus } from "./authHelpers";

/**
 * Single source of truth for post-auth navigation.
 * Waits for session, fetches role from DB, checks merchant shop status,
 * and returns the correct route.
 */
export async function postAuthRedirect(
  maxRetries = 2
): Promise<{ route: string; error?: string }> {
  // 1. Wait for session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !sessionData?.session?.user) {
    return { route: "/login", error: sessionError?.message };
  }

  const userId = sessionData.session.user.id;

  // 2. Fetch role from DB with retry
  let role: UserRole | null = null;
  let merchantStatus: MerchantStatus = null;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    const [roleResult, profileResult] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("merchant_status").eq("user_id", userId).maybeSingle(),
    ]);

    if (roleResult.data?.role) {
      role = roleResult.data.role as UserRole;
      merchantStatus = (profileResult.data?.merchant_status as MerchantStatus) ?? null;
      break;
    }

    // Role not ready yet, wait and retry
    retryCount++;
    if (retryCount <= maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!role) {
    // No role found — send to choose-role page
    return { route: "/choose-role" };
  }

  // 3. Route based on role
  switch (role) {
    case "admin":
      return { route: "/admin/dashboard" };

    case "delivery":
      return { route: "/delivery/onboarding" };

    case "merchant": {
      // Check merchant approval status
      if (merchantStatus === "pending" || merchantStatus === "rejected") {
        return { route: "/merchant/pending" };
      }

      // Check if merchant has a shop
      const { data: shops, error: shopError } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", userId)
        .limit(1);

      if (shopError) {
        console.error("Shop check failed:", shopError);
        // Still route to setup if we can't verify
        return { route: "/merchant/setup" };
      }

      if (!shops || shops.length === 0) {
        return { route: "/merchant/setup" };
      }

      return { route: "/merchant/orders" };
    }

    case "customer":
    default:
      return { route: "/home" };
  }
}

/**
 * Synchronous version for use with already-fetched data
 */
export function getRouteForRoleSync(
  role: UserRole | null,
  merchantStatus?: MerchantStatus,
  hasShop?: boolean
): string {
  if (!role) return "/choose-role";

  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "delivery":
      return "/delivery/onboarding";
    case "merchant":
      if (merchantStatus === "pending" || merchantStatus === "rejected") {
        return "/merchant/pending";
      }
      if (hasShop === false) {
        return "/merchant/setup";
      }
      return "/merchant/orders";
    case "customer":
    default:
      return "/home";
  }
}
