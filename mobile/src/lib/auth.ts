// Auth context for the SaaS Template mobile app.
// Provides login, register, logout, and automatic token restoration on mount.
// On app start the stored token is validated against the server; if expired
// the provider attempts a refresh before falling back to logged-out state.

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { api, TOKEN_KEY, ApiError, getBaseUrl } from "./api";
import { API } from "../../../shared/api";
import type { SessionUser, LoginResponse } from "../../../shared/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** SecureStore key for the refresh token. */
const REFRESH_TOKEN_KEY = "saas_refresh_token";

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

  const storeToken = async (accessToken: string, refreshToken?: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    setToken(accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  };

  const clearToken = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  /**
   * Attempt to refresh the access token using the stored refresh token.
   * On success the new tokens are persisted and the user object is returned.
   * On failure returns null -- the caller should clear the session.
   */
  const tryRefreshToken = async (): Promise<SessionUser | null> => {
    try {
      const refreshTokenValue = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshTokenValue) return null;

      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/mobile/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!res.ok) return null;

      const data = await res.json();

      // Persist the new tokens.
      const newAccessToken = data.accessToken ?? data.token;
      const newRefreshToken = data.refreshToken;
      if (!newAccessToken) return null;

      await storeToken(newAccessToken, newRefreshToken);

      // Fetch the full user profile with the new access token.
      const meRes = await fetch(`${baseUrl}/api/auth/mobile/me`, {
        headers: { Authorization: `Bearer ${newAccessToken}` },
      });

      if (meRes.ok) {
        const meData = await meRes.json();
        return meData.user ?? meData;
      }

      return null;
    } catch {
      return null;
    }
  };

  // ------- public methods -------

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<LoginResponse & { refreshToken?: string }>(
      API.login,
      { email, password },
    );
    // The server may return the access token as `token` or `accessToken`.
    const accessToken = (data as any).accessToken ?? data.token;
    await storeToken(accessToken, data.refreshToken);
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
      const profile = await api.get<SessionUser>("/api/auth/mobile/me");
      setUser(profile);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        // Token may have expired -- attempt a refresh.
        const refreshedUser = await tryRefreshToken();
        if (refreshedUser) {
          setUser(refreshedUser);
        } else {
          await clearToken();
        }
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

        // Validate the token by calling the /me endpoint on the server.
        const baseUrl = getBaseUrl();
        const meRes = await fetch(`${baseUrl}/api/auth/mobile/me`, {
          headers: { Authorization: `Bearer ${stored}` },
        });

        if (meRes.ok) {
          const meData = await meRes.json();
          if (!cancelled) {
            setUser(meData.user ?? meData);
          }
        } else if (meRes.status === 401) {
          // Access token is expired / invalid -- try to refresh.
          const refreshedUser = await tryRefreshToken();
          if (refreshedUser) {
            if (!cancelled) {
              setUser(refreshedUser);
            }
          } else {
            // Refresh failed -- clear everything.
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            if (!cancelled) {
              setToken(null);
              setUser(null);
            }
          }
        } else {
          // Some other error (network, 500, etc.) -- fall back to JWT decode
          // so the app is still usable offline with cached data.
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
        }
      } catch {
        // Token is expired / invalid -- clear it.
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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
