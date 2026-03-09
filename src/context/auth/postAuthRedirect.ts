import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";
import type { OnboardingStatus } from "./authHelpers";

export function getRouteForRoleSync(
  role: UserRole | null,
  onboardingStatus?: OnboardingStatus,
  hasShop?: boolean
): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "merchant":
      if (onboardingStatus === "pending" || onboardingStatus === "rejected")
        return "/merchant/pending";
      return "/merchant/dashboard";
    case "delivery":
      if (onboardingStatus === "pending" || onboardingStatus === "rejected")
        return "/delivery/pending";
      return "/delivery/dashboard";
    case "customer":
    default:
      return "/home";
  }
}

export async function postAuthRedirect(): Promise<{ route: string; error?: string }> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.user) {
    return { route: "/login", error: sessionError?.message };
  }

  const userId = sessionData.session.user.id;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("roles")
      .eq("user_id", userId)
      .maybeSingle();

    const roles: string[] = (profile as any)?.roles || ["customer"];

    if (roles.includes("admin")) return { route: "/admin/dashboard" };
    if (roles.includes("merchant")) return { route: "/merchant/dashboard" };
    if (roles.includes("delivery")) return { route: "/delivery/dashboard" };
    return { route: "/home" };
  } catch {
    return { route: "/home" };
  }
}