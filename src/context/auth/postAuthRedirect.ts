import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";
import type { OnboardingStatus } from "./authHelpers";

const sb = supabase as any;

/**
 * Single source of truth for post-auth navigation.
 * Checks role + onboarding_applications status for merchant/delivery.
 */
export async function postAuthRedirect(
  maxRetries = 2
): Promise<{ route: string; error?: string }> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.user) {
    return { route: "/login", error: sessionError?.message };
  }

  const userId = sessionData.session.user.id;

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

  // Customer and admin don't need onboarding approval
  if (role === "customer") return { route: "/home" };
  if (role === "admin") return { route: "/admin/dashboard" };

  // Merchant/delivery: check onboarding_applications
  const { data: application } = await sb
    .from("onboarding_applications")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  const onboardingStatus = (application?.status as OnboardingStatus) ?? null;

  if (!onboardingStatus) return { route: "/apply" };
  if (onboardingStatus === "pending" || onboardingStatus === "rejected") {
    return { route: role === "merchant" ? "/merchant/pending" : "/delivery/pending" };
  }

  // Approved
  if (role === "merchant") {
    const { data: shops } = await supabase.from("shops").select("id").eq("owner_id", userId).limit(1);
    if (!shops || shops.length === 0) return { route: "/merchant/setup" };
    return { route: "/merchant/orders" };
  }

  return { route: "/delivery/orders" };
}

/**
 * Synchronous version for use with already-fetched data
 */
export function getRouteForRoleSync(
  role: UserRole | null,
  onboardingStatus?: OnboardingStatus,
  hasShop?: boolean
): string {
  if (!role) return "/choose-role";

  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "merchant":
      if (!onboardingStatus) return "/apply";
      if (onboardingStatus === "pending" || onboardingStatus === "rejected") return "/merchant/pending";
      if (hasShop === false) return "/merchant/setup";
      return "/merchant/orders";
    case "delivery":
      if (!onboardingStatus) return "/apply";
      if (onboardingStatus === "pending" || onboardingStatus === "rejected") return "/delivery/pending";
      return "/delivery/orders";
    case "customer":
    default:
      return "/home";
  }
}
