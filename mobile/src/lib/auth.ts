// Auth context for the SaaS Template mobile app.
// Provides login, register, logout, and automatic token restoration on mount.

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { api, TOKEN_KEY, ApiError } from "./api";
import { API } from "../../../shared/api";
import type { SessionUser, LoginResponse } from "../../../shared/types";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** The currently logged-in user, or null when logged out / loading. */
  user: SessionUser | null;
  /** The raw JWT token, or null when logged out / loading. */
  token: string | null;
  /** True while the provider is restoring a token from SecureStore on mount. */
  isLoading: boolean;
  /** Log in with email and password. Stores the token and sets the user. */
  login: (email: string, password: string) => Promise<void>;
  /**
   * Register a new account. Note: provider registration does NOT auto-login --
   * the user must verify their email first. Consumer registration returns the
   * user data but does not issue a token.
   */
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<void>;
  /** Log out: clears the stored token and resets all auth state. */
  logout: () => Promise<void>;
  /** Re-fetch the current user profile from the server. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ------- helpers -------

  const storeToken = async (t: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, t);
    setToken(t);
  };

  const clearToken = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // ------- public methods -------

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<LoginResponse>(API.login, { email, password });
    await storeToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: string) => {
      await api.post(API.register, { name, email, password, role });
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearToken();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      // For consumers, use consumer profile endpoint; for providers use provider profile
      const profile = await api.get<SessionUser>(API.userProfile);
      setUser(profile);
    } catch (err) {
      // If the token has become invalid, clean up.
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        await clearToken();
      }
    }
  }, []);

  // ------- restore token on mount -------

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!stored) {
          return; // No saved session -- remain logged out.
        }

        // Optimistically set the token so that api.get uses it.
        setToken(stored);

        // Validate the token by fetching the user profile.
        // We use the login endpoint to verify, but since we already have a
        // token we just parse the JWT client-side for basic user info.
        // The full profile can be fetched separately.
        // For now, decode the JWT payload to get user info.
        const parts = stored.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (!cancelled) {
            setUser({
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              role: payload.role,
              isAdmin: payload.isAdmin ?? false,
              providerId: payload.providerId ?? null,
              consumerIds: payload.consumerIds ?? [],
              profileImage: payload.profileImage ?? null,
            });
          }
        }
      } catch {
        // Token is expired / invalid -- clear it.
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------- render -------

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the auth context. Must be called within an <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth() must be used within an <AuthProvider>");
  }
  return ctx;
}

export { AuthContext };
