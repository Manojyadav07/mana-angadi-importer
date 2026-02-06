import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";
import {
  ensureRole,
  fetchProfile,
  fetchRole,
  createRoleForUser,
  updateMerchantStatus,
   waitForProfile,
  type ProfileRow,
  type MerchantStatus,
} from "@/context/auth/authHelpers";

// Avoid build breaks if generated DB types temporarily desync
const sb = supabase as any;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  role: UserRole | null;
  isLoading: boolean;
  authError: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<ProfileRow>) => Promise<{ error: Error | null }>;
  setInitialRole: (role: UserRole) => Promise<{ error: Error | null }>;
  refresh: () => Promise<{ error: Error | null; profile: ProfileRow | null; role: UserRole | null }>;
  retryHydration: () => Promise<void>;
  // New: signup with role in one atomic flow
  signUpWithRole: (email: string, password: string, displayName: string, selectedRole: UserRole) => Promise<{ error: Error | null; userId?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  onSignOut?: () => void;
}

export function AuthProvider({ children, onSignOut }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const hydrationInFlightRef = useRef<Promise<void> | null>(null);

  const hydrateUser = useCallback(async (nextUser: User) => {
    try {
      setAuthError(null);

       // Fetch existing profile and role (profile created by database trigger)
       const [profileResult, roleResult] = await Promise.all([
         fetchProfile(nextUser.id),
         fetchRole(nextUser.id),
       ]);

       if (profileResult.error && !profileResult.error.message?.includes("No rows")) {
         console.error("Profile fetch error:", profileResult.error);
      }
       if (roleResult.error && !roleResult.error.message?.includes("No rows")) {
         console.error("Role fetch error:", roleResult.error);
      }

       // Profile should exist from trigger; if not found, wait briefly for propagation
       let finalProfile = profileResult.data as ProfileRow | null;
      if (!finalProfile) {
         const { data: retriedProfile } = await waitForProfile(nextUser.id, 3, 200);
         finalProfile = retriedProfile;
      }

      // If no role exists, leave it null — user will be sent to ChooseRolePage
      let finalRole = roleResult.data?.role as UserRole | null;

      setProfile(finalProfile);
      setRole(finalRole);
    } catch (e: any) {
      console.error("Auth hydration failed:", e);
      setAuthError(e?.message ?? "Failed to load account data");
      // Still allow app to continue: role/profile might be null, but user is authenticated.
      setProfile(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startHydration = useCallback(
    (nextUser: User) => {
      // Prevent duplicate race-condition hydrations
      if (!hydrationInFlightRef.current) {
        hydrationInFlightRef.current = hydrateUser(nextUser).finally(() => {
          hydrationInFlightRef.current = null;
        });
      }
      return hydrationInFlightRef.current;
    },
    [hydrateUser]
  );

  const retryHydration = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
   setAuthError(null);
    await hydrateUser(user);
  }, [hydrateUser, user]);

  // SINGLE source of truth for auth state
  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (!newSession?.user) {
        setProfile(null);
        setRole(null);
        setAuthError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      void startHydration(newSession.user);
    });

    // Initial session hydration
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;

      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);

      if (!data?.session?.user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      void startHydration(data.session.user);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [startHydration]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    return { error };
  };

  // New: Atomic signup that creates profile + role together
  const signUpWithRole = async (
    email: string, 
    password: string, 
    displayName: string, 
    selectedRole: UserRole
  ): Promise<{ error: Error | null; userId?: string }> => {
   setAuthError(null);
    // 1. Create auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });

    if (signUpError) return { error: signUpError };
    
    const newUser = signUpData.user;
    if (!newUser) return { error: new Error("Signup succeeded but no user returned") };

     // 2. Wait for profile to be created by database trigger
     const { data: newProfile, error: profileError } = await waitForProfile(newUser.id, 5, 400);
     
     if (profileError) {
       console.warn("Profile not found after signup:", profileError.message);
       // Continue anyway - profile may still be created
     }

     // 3. Update profile with merchant_status if merchant (profile created by trigger)
    const merchantStatus: MerchantStatus = selectedRole === "merchant" ? "pending" : null;
     if (newProfile && merchantStatus) {
       await updateMerchantStatus(newUser.id, merchantStatus);
       newProfile.merchant_status = merchantStatus;
    }

    // 4. Create role directly with selected role
    const { role: createdRole, error: roleError } = await createRoleForUser(newUser.id, selectedRole);
    
    if (roleError) {
      console.error("Role creation failed:", roleError);
      // Don't fail signup, role can be created on next hydration
    }

    // 5. Update local state
    if (newProfile) setProfile(newProfile);
    if (createdRole) setRole(createdRole);

    return { error: null, userId: newUser.id };
  };

  const signIn = async (email: string, password: string) => {
   setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setAuthError(null);
    hydrationInFlightRef.current = null;
    // Call the onSignOut callback to clear external caches (e.g., React Query)
    onSignOut?.();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error };
  };

  const refresh = useCallback(async () => {
    try {
      setAuthError(null);
      setIsLoading(true);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const nextUser = sessionData.session?.user ?? null;
      setSession(sessionData.session ?? null);
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setRole(null);
        setIsLoading(false);
        return { error: null, profile: null, role: null };
      }

      const [{ data: prof }, { data: roleRow }] = await Promise.all([
        fetchProfile(nextUser.id),
        fetchRole(nextUser.id),
      ]);

       // Profile should exist from trigger; if not, wait briefly
      let finalProfile = (prof as ProfileRow | null) ?? null;
      if (!finalProfile) {
         const { data: retriedProfile } = await waitForProfile(nextUser.id, 3, 200);
         finalProfile = retriedProfile;
      }

      // If no role exists, leave null — ChooseRolePage will handle
      let finalRole = (roleRow?.role as UserRole | null) ?? null;

      setProfile(finalProfile);
      setRole(finalRole);
      setIsLoading(false);

      return { error: null, profile: finalProfile, role: finalRole };
    } catch (e: any) {
      console.error("Auth refresh failed:", e);
      setAuthError(e?.message ?? "Failed to refresh session");
      setIsLoading(false);
      return { error: e as Error, profile: null, role: null };
    }
  }, []);

  const updateProfile = async (updates: Partial<ProfileRow>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await sb.from("profiles").update(updates).eq("user_id", user.id);
    if (!error) setProfile((prev: ProfileRow | null) => (prev ? { ...prev, ...updates } : prev));
    return { error };
  };

  const setInitialRole = async (newRole: UserRole) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Upsert role (onConflict: user_id)
    const { error } = await sb
      .from("user_roles")
      .upsert({ user_id: user.id, role: newRole }, { onConflict: "user_id" });
    
    if (error) return { error };
    
    // Update merchant_status if merchant
    if (newRole === "merchant") {
      await sb.from("profiles").update({ merchant_status: "pending" }).eq("user_id", user.id);
      setProfile((prev: ProfileRow | null) => prev ? { ...prev, merchant_status: "pending" as MerchantStatus } : prev);
    }
    
    setRole(newRole);
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        authError,
        signUp,
        signUpWithRole,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        setInitialRole,
        refresh,
        retryHydration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
