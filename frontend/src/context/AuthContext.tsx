import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authApi from "../lib/api/auth";
import { AUTH_EXPIRED_EVENT, tokenStorage } from "../lib/apiClient";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(tokenStorage.getAccess()));

  const login = async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    tokenStorage.set(tokens);
    queryClient.clear();
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string) => {
    const tokens = await authApi.register(email, password);
    tokenStorage.set(tokens);
    queryClient.clear();
    setIsAuthenticated(true);
  };

  const logout = () => {
    tokenStorage.clear();
    queryClient.clear();
    setIsAuthenticated(false);
  };

  // the API client could not refresh the session: send the user back to sign-in
  useEffect(() => {
    const onExpired = () => {
      queryClient.clear();
      setIsAuthenticated(false);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
