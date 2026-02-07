import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";
import type { OnboardingStatus } from "./authHelpers";

/**
 * Post-auth navigation: always sends users to /home.
 * Other dashboards are reached via the Switch Mode menu.
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

  return { route: "/home" };
}

/**
 * Synchronous fallback — always /home unless no role.
 */
export function getRouteForRoleSync(
  role: UserRole | null,
  _onboardingStatus?: OnboardingStatus,
  _hasShop?: boolean
): string {
  return "/home";
}
