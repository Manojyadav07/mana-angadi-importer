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

export async function fetchRole(userId: string) {
  return sb.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
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

export async function ensureRole(userId: string, defaultRole: UserRole = "customer") {
  const { data: existing, error: fetchErr } = await fetchRole(userId);
  if (fetchErr && !fetchErr.message?.includes("No rows")) return { role: null as UserRole | null, error: fetchErr };
  if (existing?.role) return { role: existing.role as UserRole, error: null };

  const { data, error } = await sb
    .from("user_roles")
    .upsert({ user_id: userId, role: defaultRole }, { onConflict: "user_id" })
    .select("role")
    .single();

  if (error) {
    const { data: refetch } = await fetchRole(userId);
    if (refetch?.role) return { role: refetch.role as UserRole, error: null };
    return { role: null as UserRole | null, error };
  }
  return { role: (data?.role as UserRole | null) ?? defaultRole, error: null };
}

export async function createRoleForUser(userId: string, role: UserRole) {
  const { data: existing, error: fetchErr } = await fetchRole(userId);
  if (fetchErr && !fetchErr.message?.includes("No rows")) return { role: null as UserRole | null, error: fetchErr };
  if (existing?.role) return { role: existing.role as UserRole, error: null };

  const { data, error } = await sb
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" })
    .select("role")
    .single();

  if (error) {
    const { data: refetch } = await fetchRole(userId);
    if (refetch?.role) return { role: refetch.role as UserRole, error: null };
    return { role: null as UserRole | null, error };
  }
  return { role: (data?.role as UserRole | null) ?? role, error: null };
}

export async function updateRoleForUser(userId: string, newRole: UserRole) {
  const { data: existing, error: readError } = await fetchRole(userId);
  if (readError) return { role: null as UserRole | null, error: readError };
  if (existing?.role && existing.role !== "customer") return { role: existing.role as UserRole, error: new Error("Role already set") };

  const upsertRes = await sb
    .from("user_roles")
    .upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" })
    .select("role")
    .maybeSingle();

  if (upsertRes.error) {
    const { data: refetch } = await fetchRole(userId);
    if (refetch?.role) return { role: refetch.role as UserRole, error: null };
    return { role: null as UserRole | null, error: upsertRes.error };
  }
  return { role: (upsertRes.data?.role as UserRole | null) ?? newRole, error: null };
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
