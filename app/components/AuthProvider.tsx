"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import type { AuthUser, MemberStatus } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  status: MemberStatus | null;
  loading: boolean;
  login: (identifier: string, password: string, remember?: boolean) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Loads and shares the signed-in member's session state across the app.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetches the current signed-in member from GET /api/auth/me.
  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const data = await apiFetch<{ user: AuthUser }>("/api/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Signs in a member and immediately refreshes their full session summary.
  const login = useCallback(
    async (identifier: string, password: string, remember = true): Promise<AuthUser> => {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: { identifier, password, remember },
      });
      const loaded = await refresh();
      if (!loaded) {
        throw new Error("Signed in, but could not load your profile. Please try again.");
      }
      return loaded;
    },
    [refresh],
  );

  // Signs out the member and clears local auth state.
  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status: user?.status ?? null,
        loading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Returns the current AuthContext value inside any client component.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return ctx;
}
