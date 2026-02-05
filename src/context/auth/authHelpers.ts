import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types";

// NOTE: We intentionally keep the DB calls loosely typed here to avoid build breaks
// if generated DB types momentarily desync.
const sb = supabase as any;

export type MerchantStatus = "pending" | "approved" | "rejected" | null;

export type ProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: "te" | "en" | null;
  merchant_status: MerchantStatus;
};

export async function fetchProfile(userId: string) {
  return sb.from("profiles").select("*").eq("user_id", userId).maybeSingle();
}

export async function ensureProfile(user: User, merchantStatus?: MerchantStatus) {
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : null);

  // Use upsert with onConflict to handle existing rows gracefully
  const upsertRes = await sb
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        display_name: displayName,
        preferred_language: "te",
        merchant_status: merchantStatus ?? null,
      },
      { onConflict: "user_id", ignoreDuplicates: false }
    )
    .select("*")
    .maybeSingle();

  if (upsertRes.error) {
    // Fallback: if upsert fails (e.g., conflict issue), try fetching existing
    console.warn("Profile upsert failed, attempting fetch:", upsertRes.error.message);
    const { data: existing, error: fetchErr } = await fetchProfile(user.id);
    if (fetchErr) return { data: null as ProfileRow | null, error: fetchErr };
    if (existing) return { data: existing as ProfileRow, error: null };
    
    // If still no profile, return the original error
    return { data: null as ProfileRow | null, error: upsertRes.error };
  }

  return { data: (upsertRes.data as ProfileRow | null) ?? null, error: null };
}

export async function fetchRole(userId: string) {
  return sb.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
}

export async function ensureRole(userId: string, defaultRole: UserRole = "customer") {
  // Use upsert with onConflict to handle existing rows gracefully
  // ignoreDuplicates: true means if role exists, don't update it (keep existing)
  const upsertRes = await sb
    .from("user_roles")
    .upsert(
      { user_id: userId, role: defaultRole },
      { onConflict: "user_id", ignoreDuplicates: true }
    )
    .select("role")
    .maybeSingle();

  if (upsertRes.error) {
    // Fallback: if upsert fails, try fetching existing role
    console.warn("Role upsert failed, attempting fetch:", upsertRes.error.message);
    const { data: existing, error: fetchErr } = await fetchRole(userId);
    if (fetchErr) return { role: null as UserRole | null, error: fetchErr };
    if (existing?.role) return { role: existing.role as UserRole, error: null };
    
    // If still no role, return the original error
    return { role: null as UserRole | null, error: upsertRes.error };
  }

  // If upsert succeeded but returned no data (ignoreDuplicates case), fetch existing
  if (!upsertRes.data) {
    const { data: existing } = await fetchRole(userId);
    return { role: (existing?.role as UserRole | null) ?? defaultRole, error: null };
  }

  return { role: (upsertRes.data?.role as UserRole | null) ?? null, error: null };
}

// Create role directly with specific role (for signup flow)
export async function createRoleForUser(userId: string, role: UserRole) {
  // Use upsert with ignoreDuplicates: true to preserve existing roles
  // This prevents overwriting if user already has a role
  const upsertRes = await sb
    .from("user_roles")
    .upsert(
      { user_id: userId, role },
      { onConflict: "user_id", ignoreDuplicates: true }
    )
    .select("role")
    .maybeSingle();

  if (upsertRes.error) {
    // Fallback: if upsert fails, try fetching existing role
    console.warn("Role creation failed, attempting fetch:", upsertRes.error.message);
    const { data: existing, error: fetchErr } = await fetchRole(userId);
    if (fetchErr) return { role: null as UserRole | null, error: fetchErr };
    if (existing?.role) return { role: existing.role as UserRole, error: null };
    
    return { role: null as UserRole | null, error: upsertRes.error };
  }

  // If ignoreDuplicates returned no data, fetch existing role
  if (!upsertRes.data) {
    const { data: existing } = await fetchRole(userId);
    return { role: (existing?.role as UserRole | null) ?? role, error: null };
  }

  return { role: (upsertRes.data?.role as UserRole | null) ?? null, error: null };
}

// Update role from "customer" to selected role - used during signup flow
export async function updateRoleForUser(userId: string, newRole: UserRole) {
  const { data: existing, error: readError } = await fetchRole(userId);
  if (readError) return { role: null as UserRole | null, error: readError };

  // If role exists and is not "customer", don't allow changing (prevent escalation)
  if (existing?.role && existing.role !== "customer") {
    return { role: existing.role as UserRole, error: new Error("Role already set") };
  }

  // If no role exists, upsert; otherwise update from "customer"
  if (!existing?.role) {
    const upsertRes = await sb
      .from("user_roles")
      .upsert(
        { user_id: userId, role: newRole },
        { onConflict: "user_id" }
      )
      .select("role")
      .maybeSingle();
    
    if (upsertRes.error) {
      // Fallback on failure
      const { data: refetch } = await fetchRole(userId);
      if (refetch?.role) return { role: refetch.role as UserRole, error: null };
      return { role: null as UserRole | null, error: upsertRes.error };
    }
    return { role: (upsertRes.data?.role as UserRole | null) ?? null, error: null };
  } else {
    const updateRes = await sb
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId)
      .select("role")
      .maybeSingle();
    return { role: (updateRes.data?.role as UserRole | null) ?? null, error: updateRes.error };
  }
}

// Update merchant status
export async function updateMerchantStatus(userId: string, status: MerchantStatus) {
  const { error } = await sb
    .from("profiles")
    .update({ merchant_status: status })
    .eq("user_id", userId);
  return { error };
}

export function getRouteForRole(role: UserRole | null, merchantStatus?: MerchantStatus) {
  switch (role) {
    case "merchant":
      // If merchant is pending approval, show pending page
      if (merchantStatus === "pending") {
        return "/merchant/pending";
      }
      // Merchants will be redirected by MerchantWithShopRoute if they don't have a shop
      return "/merchant/orders";
    case "delivery":
      return "/delivery/onboarding";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/home";
  }
}
