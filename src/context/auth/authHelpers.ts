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
  const { data, error } = await fetchProfile(user.id);
  if (error) return { data: null as ProfileRow | null, error };
  if (data) return { data: data as ProfileRow, error: null };

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : null);

  const insertRes = await sb
    .from("profiles")
    .insert({
      user_id: user.id,
      display_name: displayName,
      preferred_language: "te",
      merchant_status: merchantStatus ?? null,
    })
    .select("*")
    .maybeSingle();

  return { data: (insertRes.data as ProfileRow | null) ?? null, error: insertRes.error };
}

export async function fetchRole(userId: string) {
  return sb.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
}

export async function ensureRole(userId: string, defaultRole: UserRole = "customer") {
  const { data, error } = await fetchRole(userId);
  if (error) return { role: null as UserRole | null, error };
  if (data?.role) return { role: data.role as UserRole, error: null };

  const insertRes = await sb
    .from("user_roles")
    .insert({ user_id: userId, role: defaultRole })
    .select("role")
    .maybeSingle();

  return { role: (insertRes.data?.role as UserRole | null) ?? null, error: insertRes.error };
}

// Create role directly with specific role (for signup flow)
export async function createRoleForUser(userId: string, role: UserRole) {
  // First check if role already exists
  const { data: existing, error: readError } = await fetchRole(userId);
  if (readError) return { role: null as UserRole | null, error: readError };
  
  // If role already exists, return it (don't overwrite)
  if (existing?.role) {
    return { role: existing.role as UserRole, error: null };
  }

  // Insert the new role directly
  const insertRes = await sb
    .from("user_roles")
    .insert({ user_id: userId, role })
    .select("role")
    .maybeSingle();

  return { role: (insertRes.data?.role as UserRole | null) ?? null, error: insertRes.error };
}

// Update role from "customer" to selected role - used during signup flow
export async function updateRoleForUser(userId: string, newRole: UserRole) {
  const { data: existing, error: readError } = await fetchRole(userId);
  if (readError) return { role: null as UserRole | null, error: readError };

  // If role exists and is not "customer", don't allow changing (prevent escalation)
  if (existing?.role && existing.role !== "customer") {
    return { role: existing.role as UserRole, error: new Error("Role already set") };
  }

  // If no role exists, insert; otherwise update from "customer"
  if (!existing?.role) {
    const insertRes = await sb
      .from("user_roles")
      .insert({ user_id: userId, role: newRole })
      .select("role")
      .maybeSingle();
    return { role: (insertRes.data?.role as UserRole | null) ?? null, error: insertRes.error };
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
