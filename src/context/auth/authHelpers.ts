import { supabase } from "@/integrations/supabase/client";
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

 // Wait for profile created by database trigger (with retry for propagation delay)
 export async function waitForProfile(userId: string, maxAttempts = 5, delayMs = 300): Promise<{ data: ProfileRow | null; error: Error | null }> {
   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
     const { data, error } = await fetchProfile(userId);
     
     if (data) {
       return { data: data as ProfileRow, error: null };
     }
     
     if (error && !error.message?.includes("No rows")) {
       return { data: null, error };
     }
     
     // Profile not ready yet, wait and retry
     if (attempt < maxAttempts) {
       await new Promise(resolve => setTimeout(resolve, delayMs));
     }
   }
   
   return { data: null, error: new Error("Profile not found after signup - trigger may have failed") };
}

export async function fetchRole(userId: string) {
  return sb.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
}

 // Ensure role exists - only creates if missing, never duplicates
 export async function ensureRole(userId: string, defaultRole: UserRole = "customer") {
   // First check if role already exists
   const { data: existing, error: fetchErr } = await fetchRole(userId);
   if (fetchErr && !fetchErr.message?.includes("No rows")) {
     return { role: null as UserRole | null, error: fetchErr };
   }
 
   // If role exists, return it (don't create duplicate)
   if (existing?.role) {
     return { role: existing.role as UserRole, error: null };
   }
 
   // No role exists, insert new one
   const { data, error } = await sb
     .from("user_roles")
     .insert({ user_id: userId, role: defaultRole })
     .select("role")
     .single();
 
   if (error) {
     // Could be race condition duplicate, try fetching again
     if (error.message?.includes("duplicate") || error.code === "23505") {
       const { data: refetch } = await fetchRole(userId);
       if (refetch?.role) return { role: refetch.role as UserRole, error: null };
     }
     return { role: null as UserRole | null, error };
   }
 
   return { role: (data?.role as UserRole | null) ?? defaultRole, error: null };
}

 // Create role directly with specific role (for signup flow) - only if not exists
export async function createRoleForUser(userId: string, role: UserRole) {
   // First check if role already exists
   const { data: existing, error: fetchErr } = await fetchRole(userId);
   if (fetchErr && !fetchErr.message?.includes("No rows")) {
     return { role: null as UserRole | null, error: fetchErr };
   }
 
   // If role already exists, return it (don't create duplicate)
   if (existing?.role) {
     return { role: existing.role as UserRole, error: null };
   }
 
   // No role exists, insert new one
   const { data, error } = await sb
    .from("user_roles")
     .insert({ user_id: userId, role })
    .select("role")
     .single();

   if (error) {
     // Could be race condition duplicate, try fetching again
     if (error.message?.includes("duplicate") || error.code === "23505") {
       const { data: refetch } = await fetchRole(userId);
       if (refetch?.role) return { role: refetch.role as UserRole, error: null };
     }
     return { role: null as UserRole | null, error };
  }

   return { role: (data?.role as UserRole | null) ?? role, error: null };
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
