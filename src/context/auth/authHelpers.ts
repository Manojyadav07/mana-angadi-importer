import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types";

// NOTE: We intentionally keep the DB calls loosely typed here to avoid build breaks
// if generated DB types momentarily desync.
const sb = supabase as any;

export type ProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: "te" | "en" | null;
};

export async function fetchProfile(userId: string) {
  return sb.from("profiles").select("*").eq("user_id", userId).maybeSingle();
}

export async function ensureProfile(user: User) {
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

export function getRouteForRole(role: UserRole | null) {
  switch (role) {
    case "merchant":
      return "/merchant/orders";
    case "delivery":
      return "/delivery/onboarding";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/home";
  }
}
