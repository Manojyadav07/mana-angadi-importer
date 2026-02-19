import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { UserRole } from "@/types";

export type UserMode = "customer" | "merchant" | "delivery" | "admin";

const USER_MODE_KEY = "mana-angadi-user-mode";

interface UserModeContextType {
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  resetMode: () => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: React.ReactNode }) {
  const [userMode, setUserModeState] = useState<UserMode>(() => {
    const stored = localStorage.getItem(USER_MODE_KEY);
    if (stored === "customer" || stored === "merchant" || stored === "delivery" || stored === "admin") {
      return stored;
    }
    return "customer";
  });

  const setUserMode = useCallback((mode: UserMode) => {
    setUserModeState(mode);
    localStorage.setItem(USER_MODE_KEY, mode);
  }, []);

  const resetMode = useCallback(() => {
    setUserModeState("customer");
    localStorage.setItem(USER_MODE_KEY, "customer");
  }, []);

  return (
    <UserModeContext.Provider value={{ userMode, setUserMode, resetMode }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (!context) throw new Error("useUserMode must be used within a UserModeProvider");
  return context;
}

/**
 * Get the home route for a given user mode.
 */
export function getRouteForMode(mode: UserMode): string {
  switch (mode) {
    case "admin": return "/admin/dashboard";
    case "merchant": return "/merchant/orders";
    case "delivery": return "/delivery/orders";
    case "customer":
    default:
      return "/home";
  }
}
