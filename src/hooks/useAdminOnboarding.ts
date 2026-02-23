import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sb = supabase as any;

export interface OnboardingRow {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  role: string | null;
}

export interface OnboardingWithProfile extends OnboardingRow {
  profile: ProfileRow | null;
}

export function useAdminOnboarding() {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin-onboarding-applications"],
    queryFn: async () => {
      // Fetch all applications
      const { data: apps, error } = await sb
        .from("onboarding_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all applicants
      const userIds = (apps as OnboardingRow[]).map((a) => a.user_id);
      let profiles: ProfileRow[] = [];
      if (userIds.length > 0) {
        const { data: profileData, error: pErr } = await sb
          .from("profiles")
          .select("id, user_id, display_name, phone, role")
          .in("user_id", userIds);
        if (!pErr && profileData) profiles = profileData as ProfileRow[];
      }

      const profileMap = new Map(profiles.map((p) => [p.user_id, p]));

      return (apps as OnboardingRow[]).map((app) => ({
        ...app,
        profile: profileMap.get(app.user_id) || null,
      })) as OnboardingWithProfile[];
    },
  });

  const approveMerchant = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error: roleError } = await sb
        .from("profiles")
        .update({ role: "merchant" })
        .eq("user_id", userId);

      if (roleError) throw roleError;

      const { error: appError } = await sb
        .from("onboarding_applications")
        .update({ status: "approved" })
        .eq("user_id", userId);

      if (appError) throw appError;

      // Also update user_roles table
      const { error: urError } = await sb
        .from("user_roles")
        .update({ role: "merchant" })
        .eq("user_id", userId);

      if (urError) console.warn("user_roles update failed (may need service_role):", urError);

      toast.success("Application approved");
      queryClient.invalidateQueries({ queryKey: ["admin-onboarding-applications"] });
    } catch (err: any) {
      console.error("Approve error:", err);
      toast.error(err.message || "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectApplication = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await sb
        .from("onboarding_applications")
        .update({ status: "rejected" })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Application rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-onboarding-applications"] });
    } catch (err: any) {
      console.error("Reject error:", err);
      toast.error(err.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  return {
    applications: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    actionLoading,
    approveMerchant,
    rejectApplication,
    refetch: query.refetch,
  };
}
