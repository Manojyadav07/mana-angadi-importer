/* AuthContext – provides auth state to the component tree */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";
import {
  resolveRole,
  fetchProfile,
  fetchRole,
  updateMerchantStatus,
  waitForProfile,
  fetchOnboardingApplication,
  createOnboardingApplication,
  type ProfileRow,
  type MerchantStatus,
  type OnboardingStatus,
  type OnboardingApplicationRow,
} from "@/context/auth/authHelpers";

const sb = supabase as any;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  role: UserRole | null;
  onboardingStatus: OnboardingStatus;
  isLoading: boolean;
  authReady: boolean;
  authError: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<ProfileRow>) => Promise<{ error: Error | null }>;
  refresh: () => Promise<{ error: Error | null; profile: ProfileRow | null; role: UserRole | null }>;
  retryHydration: () => Promise<void>;
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
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const hydrationInFlightRef = useRef<Promise<void> | null>(null);

  const hydrateUser = useCallback(async (nextUser: User) => {
    try {
      setAuthError(null);

      // TODO(2026-02-21): Remove this RPC fallback after 24h once Auth Hook stability is confirmed.
      // Harmless fallback: ensure profile + role rows exist server-side.
      // Wrapped in try/catch — must never block login or crash the UI.
      try {
        await sb.rpc("ensure_user_bootstrap");
      } catch (e: any) {
        console.warn("[auth] ensure_user_bootstrap RPC failed (non-fatal):", e?.message);
      }

      const [profileResult, roleResult] = await Promise.all([
        fetchProfile(nextUser.id),
        resolveRole(nextUser.id),
      ]);

      if (profileResult.error && !profileResult.error.message?.includes("No rows")) {
        console.error("Profile fetch error:", profileResult.error);
      }

      let finalProfile = profileResult.data as ProfileRow | null;
      if (!finalProfile) {
        const { data: retriedProfile } = await waitForProfile(nextUser.id, 3, 200);
        finalProfile = retriedProfile;
      }

      const finalRole = roleResult.role;

      // Fetch onboarding status for merchant/delivery
      let finalOnboardingStatus: OnboardingStatus = null;
      if (finalRole === "merchant" || finalRole === "delivery") {
        const { data: app } = await fetchOnboardingApplication(nextUser.id);
        finalOnboardingStatus = (app?.status as OnboardingStatus) ?? null;
      }

      setProfile(finalProfile);
      setRole(finalRole);
      setOnboardingStatus(finalOnboardingStatus);
    } catch (e: any) {
      console.error("Auth hydration failed:", e);
      setAuthError(e?.message ?? "Failed to load account data");
      setProfile(null);
      setRole(null);
      setOnboardingStatus(null);
    } finally {
      setIsLoading(false);
      setAuthReady(true);
    }
  }, []);

  const startHydration = useCallback(
    (nextUser: User) => {
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

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (!newSession?.user) {
        setProfile(null);
        setRole(null);
        setOnboardingStatus(null);
        setAuthError(null);
        setIsLoading(false);
        setAuthReady(true);
        return;
      }

      setIsLoading(true);
      void startHydration(newSession.user);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);

      if (!data?.session?.user) {
        setIsLoading(false);
        setAuthReady(true);
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
    setOnboardingStatus(null);
    setAuthError(null);
    hydrationInFlightRef.current = null;
    onSignOut?.();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
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
        setOnboardingStatus(null);
        setIsLoading(false);
        return { error: null, profile: null, role: null };
      }

      const [{ data: prof }, roleResult] = await Promise.all([
        fetchProfile(nextUser.id),
        resolveRole(nextUser.id),
      ]);

      let finalProfile = (prof as ProfileRow | null) ?? null;
      if (!finalProfile) {
        const { data: retriedProfile } = await waitForProfile(nextUser.id, 3, 200);
        finalProfile = retriedProfile;
      }

      const finalRole = roleResult.role;

      let finalOnboardingStatus: OnboardingStatus = null;
      if (finalRole === "merchant" || finalRole === "delivery") {
        const { data: app } = await fetchOnboardingApplication(nextUser.id);
        finalOnboardingStatus = (app?.status as OnboardingStatus) ?? null;
      }

      setProfile(finalProfile);
      setRole(finalRole);
      setOnboardingStatus(finalOnboardingStatus);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        onboardingStatus,
        isLoading,
        authReady,
        authError,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
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
