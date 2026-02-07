import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";
import type { OnboardingStatus } from "./authHelpers";

const USER_MODE_KEY = "mana-angadi-user-mode";

function resolveRoute(): string {
  const mode = localStorage.getItem(USER_MODE_KEY);
  if (mode === "merchant") return "/merchant/orders";
  if (mode === "delivery") return "/delivery/orders";
  if (mode === "admin") return "/admin/dashboard";
  // Default: ensure localStorage is set
  localStorage.setItem(USER_MODE_KEY, "customer");
  return "/home";
}

/**
 * Post-auth navigation: route based on user_mode in localStorage.
 * Defaults to customer / /home if user_mode is missing.
 */
export async function postAuthRedirect(
  maxRetries = 2
): Promise<{ route: string; error?: string }> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.user) {
    return { route: "/login", error: sessionError?.message };
  }

  return { route: resolveRoute() };
}

/**
 * Synchronous fallback — route based on user_mode localStorage.
 */
export function getRouteForRoleSync(
  _role: UserRole | null,
  _onboardingStatus?: OnboardingStatus,
  _hasShop?: boolean
): string {
  return resolveRoute();
}
