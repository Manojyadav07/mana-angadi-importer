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

export async function waitForProfile(userId: string, maxAttempts = 5, delayMs = 300): Promise<{ data: ProfileRow | null; error: Error | null }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data, error } = await fetchProfile(userId);
    if (data) return { data: data as ProfileRow, error: null };
    if (error && !error.message?.includes("No rows")) return { data: null, error };
    if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return { data: null, error: new Error("Profile not found after signup") };
}

/** Read-only: fetch the user's role from user_roles */
export async function fetchRole(userId: string): Promise<{ data: { role: string } | null; error: any }> {
  return sb.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
}

/**
 * Read-only role resolution. Returns the role from DB, or 'customer' as default.
 * Never writes to user_roles — the trigger on auth.users handles that.
 */
export async function resolveRole(userId: string): Promise<{ role: UserRole; error: any }> {
  const { data, error } = await fetchRole(userId);
  if (error && !error.message?.includes("No rows")) {
    return { role: "customer", error };
  }
  if (data?.role) {
    return { role: data.role as UserRole, error: null };
  }
  console.warn("[auth] No role row found for user", userId, "— defaulting to 'customer'. The DB trigger should have created one.");
  return { role: "customer", error: null };
}

export async function fetchOnboardingApplication(userId: string): Promise<{ data: OnboardingApplicationRow | null; error: any }> {
  return sb.from("onboarding_applications").select("*").eq("user_id", userId).maybeSingle();
}

export async function createOnboardingApplication(userId: string, role: string) {
  return sb
    .from("onboarding_applications")
    .upsert({ user_id: userId, role, status: "pending" }, { onConflict: "user_id" })
    .select()
    .single();
}

export async function updateMerchantStatus(userId: string, status: MerchantStatus) {
  const { error } = await sb.from("profiles").update({ merchant_status: status }).eq("user_id", userId);
  return { error };
}

export function getRouteForRole(role: UserRole | null, onboardingStatus?: OnboardingStatus) {
  switch (role) {
    case "merchant":
      if (!onboardingStatus) return "/apply";
      if (onboardingStatus === "pending" || onboardingStatus === "rejected") return "/merchant/pending";
      return "/merchant/orders";
    case "delivery":
      if (!onboardingStatus) return "/apply";
      if (onboardingStatus === "pending" || onboardingStatus === "rejected") return "/delivery/pending";
      return "/delivery/orders";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/home";
  }
}
