import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../lib/api";
import { authApi, AuthResponse, AuthUser } from "../lib/authApi";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  authorizedRequest: <T>(path: string, init?: Omit<RequestInit, "body"> & { body?: unknown }) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  const refreshRef = useRef<Promise<AuthResponse> | null>(null);

  const apply = useCallback((response: AuthResponse) => {
    tokenRef.current = response.accessToken;
    setAccessToken(response.accessToken);
    setUser(response.user);
    return response;
  }, []);
  const clear = useCallback(() => { tokenRef.current = null; setAccessToken(null); setUser(null); }, []);

  const refresh = useCallback(() => {
    if (!refreshRef.current) refreshRef.current = authApi.refresh().then(apply).finally(() => { refreshRef.current = null; });
    return refreshRef.current;
  }, [apply]);

  useEffect(() => {
    refresh().catch(clear).finally(() => setAuthLoading(false));
  }, [clear, refresh]);

  const value = useMemo<AuthContextValue>(() => ({
    user, accessToken, authLoading,
    login: (email, password) => authApi.login({ email, password }).then(apply),
    async logout() { try { await authApi.logout(); } finally { clear(); } },
    async authorizedRequest<T>(path: string, init = {}) {
      try {
        return await apiRequest<T>(path, { ...init, token: tokenRef.current });
      } catch (error) {
        if (!(error instanceof Error) || !("status" in error) || error.status !== 401) throw error;
        try {
          const session = await refresh();
          return await apiRequest<T>(path, { ...init, token: session.accessToken });
        } catch (refreshError) {
          clear();
          throw refreshError;
        }
      }
    },
  }), [accessToken, apply, authLoading, clear, refresh, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
