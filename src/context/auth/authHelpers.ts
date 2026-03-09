import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";

const sb = supabase as any;

export type MerchantStatus = "pending" | "approved" | "rejected" | null;
export type OnboardingStatus = "pending" | "approved" | "rejected" | null;

export type ProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: "te" | "en" | null;
  merchant_status: MerchantStatus;
};

export type OnboardingApplicationRow = {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
};

export async function fetchProfile(userId: string) {
  return sb.from("profiles").select("*").eq("user_id", userId).maybeSingle();
}

export async function waitForProfile(
  userId: string,
  maxAttempts = 5,
  delayMs = 300
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data, error } = await fetchProfile(userId);
    if (data) return { data: data as ProfileRow, error: null };
    if (error && !error.message?.includes("No rows")) return { data: null, error };
    if (attempt < maxAttempts)
      await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return { data: null, error: new Error("Profile not found after signup") };
}

/**
 * Read role from profiles.roles[] array — current schema.
 * Priority: admin > merchant > delivery > customer
 */
export async function fetchRole(
  userId: string
): Promise<{ data: { role: string } | null; error: any }> {
  const { data, error } = await sb
    .from("profiles")
    .select("roles")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data?.roles || data.roles.length === 0)
    return { data: { role: "customer" }, error: null };

  const roles: string[] = data.roles;

  if (roles.includes("admin")) return { data: { role: "admin" }, error: null };
  if (roles.includes("merchant")) return { data: { role: "merchant" }, error: null };
  if (roles.includes("delivery")) return { data: { role: "delivery" }, error: null };
  return { data: { role: "customer" }, error: null };
}

/**
 * Read-only role resolution from profiles.roles[] array.
 * Falls back to 'customer' if no roles found.
 */
export async function resolveRole(
  userId: string
): Promise<{ role: UserRole; error: any }> {
  const { data, error } = await fetchRole(userId);
  if (error && !error.message?.includes("No rows")) {
    return { role: "customer", error };
  }
  if (data?.role) {
    return { role: data.role as UserRole, error: null };
  }
  console.warn(
    "[auth] No role found for user",
    userId,
    "— defaulting to 'customer'"
  );
  return { role: "customer", error: null };
}

export async function fetchOnboardingApplication(
  userId: string
): Promise<{ data: OnboardingApplicationRow | null; error: any }> {
  return sb
    .from("onboarding_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
}

export async function createOnboardingApplication(
  userId: string,
  role: string
) {
  return sb
    .from("onboarding_applications")
    .upsert(
      { user_id: userId, role, status: "pending" },
      { onConflict: "user_id" }
    )
    .select()
    .single();
}

export async function updateMerchantStatus(
  userId: string,
  status: MerchantStatus
) {
  const { error } = await sb
    .from("profiles")
    .update({ merchant_status: status })
    .eq("user_id", userId);
  return { error };
}

export function getRouteForRole(
  role: UserRole | null,
  onboardingStatus?: OnboardingStatus
) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "merchant":
      if (!onboardingStatus) return "/apply";
      if (onboardingStatus === "pending" || onboardingStatus === "rejected")
        return "/merchant/pending";
      return "/merchant/orders";
    case "delivery":
      if (!onboardingStatus) return "/apply";
      if (onboardingStatus === "pending" || onboardingStatus === "rejected")
        return "/delivery/pending";
      return "/delivery/orders";
    default:
      return "/home";
  }
}