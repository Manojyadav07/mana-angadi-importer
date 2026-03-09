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
  roles: string[];
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
      const { data: apps, error } = await sb
        .from("onboarding_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = (apps as OnboardingRow[]).map((a) => a.user_id);
      let profiles: ProfileRow[] = [];
      if (userIds.length > 0) {
        const { data: profileData, error: pErr } = await sb
          .from("profiles")
          .select("id, user_id, display_name, phone, roles")
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
      // 1. Get current roles
      const { data: profile, error: fetchError } = await sb
        .from("profiles")
        .select("roles")
        .eq("user_id", userId)
        .maybeSingle();
  
      if (fetchError) throw fetchError;
  
      // 2. Get application form_data to auto-create shop
      const { data: application, error: appFetchError } = await sb
        .from("onboarding_applications")
        .select("form_data")
        .eq("user_id", userId)
        .maybeSingle();
  
      if (appFetchError) throw appFetchError;
  
      const formData = application?.form_data as any;
  
      // 3. Add merchant to roles[]
      const currentRoles: string[] = profile?.roles || ["customer"];
      const newRoles = currentRoles.includes("merchant")
        ? currentRoles
        : [...currentRoles, "merchant"];
  
      const { error: roleError } = await sb
        .from("profiles")
        .update({ roles: newRoles })
        .eq("user_id", userId);
  
      if (roleError) throw roleError;
  
      // 4. Auto-create shop from form_data if not already exists
      const { data: existingShop } = await sb
        .from("shops")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();
  
      if (!existingShop && formData) {
        // Map business_type to shop type
        const typeMap: Record<string, string> = {
          grocery: "kirana",
          restaurant: "restaurant",
          medical: "medical",
          bakery: "kirana",
          fruits_vegetables: "kirana",
          dairy: "kirana",
          general: "kirana",
          other: "kirana",
        };
        const shopType = typeMap[formData.business_type] || "kirana";
        const shopName = formData.shop_name || "My Shop";
  
        const { error: shopError } = await sb.from("shops").insert({
          owner_id: userId,
          name: shopName,
          name_te: shopName,
          name_en: shopName,
          type: shopType,
          is_open: true,
          is_active: true,
          town_id: formData.town_id || null,
          upi_vpa: formData.upi_id || null,
        });
  
        if (shopError) console.warn("Shop auto-create failed:", shopError);
      }
  
      // 5. Mark application as approved
      const { error: appError } = await sb
        .from("onboarding_applications")
        .update({ status: "approved" })
        .eq("user_id", userId);
  
      if (appError) throw appError;
  
      toast.success("Application approved ✅ Shop created automatically");
      queryClient.invalidateQueries({ queryKey: ["admin-onboarding-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
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