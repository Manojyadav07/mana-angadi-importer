import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OnboardingStatus = "pending" | "approved" | "rejected" | null;

export interface OnboardingApplication {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export function useOnboardingApplication(userId: string | undefined) {
  return useQuery({
    queryKey: ["onboarding-application", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await (supabase as any)
        .from("onboarding_applications")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as OnboardingApplication | null;
    },
    enabled: !!userId,
  });
}

export async function fetchOnboardingApplication(userId: string) {
  const { data, error } = await (supabase as any)
    .from("onboarding_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { data: data as OnboardingApplication | null, error };
}

export async function createOnboardingApplication(userId: string, role: string) {
  const { data, error } = await (supabase as any)
    .from("onboarding_applications")
    .upsert(
      { user_id: userId, role, status: "pending" },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  return { data: data as OnboardingApplication | null, error };
}
