import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types";
import {
  ensureProfile,
  ensureRole,
  fetchProfile,
  fetchRole,
  type ProfileRow,
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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

      // Ensure profile + role exist (never store role on profile)
      const [{ data: ensuredProfile, error: profileError }, { role: ensuredRole, error: roleError }] =
        await Promise.all([ensureProfile(nextUser), ensureRole(nextUser.id, "customer")]);

      if (profileError) throw profileError;
      if (roleError) throw roleError;

      setProfile(ensuredProfile);
      setRole(ensuredRole);
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

  const signIn = async (email: string, password: string) => {
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

      let finalProfile = (prof as ProfileRow | null) ?? null;
      if (!finalProfile) {
        const ensured = await ensureProfile(nextUser);
        if (ensured.error) throw ensured.error;
        finalProfile = ensured.data;
      }

      let finalRole = (roleRow?.role as UserRole | null) ?? null;
      if (!finalRole) {
        const ensured = await ensureRole(nextUser.id, "customer");
        if (ensured.error) throw ensured.error;
        finalRole = ensured.role;
      }

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

  // Update user's role - allows changing from default "customer" to selected role during signup
  const setInitialRole = async (newRole: UserRole) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Check if user already has a non-customer role (prevent role escalation)
    const { data: existing, error: readError } = await fetchRole(user.id);
    if (readError) return { error: readError };

    // If role exists and is not "customer", don't allow changing
    if (existing?.role && existing.role !== "customer") {
      return { error: new Error("Role already set") };
    }

    // If no role exists, insert; otherwise update from "customer" to the new role
    if (!existing?.role) {
      const { error } = await sb.from("user_roles").insert({ user_id: user.id, role: newRole });
      if (!error) setRole(newRole);
      return { error };
    } else {
      // Update existing "customer" role to selected role
      const { error } = await sb.from("user_roles").update({ role: newRole }).eq("user_id", user.id);
      if (!error) setRole(newRole);
      return { error };
    }
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

