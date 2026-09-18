import { createContext, useContext, useState, type ReactNode } from "react";
import * as authApi from "../lib/api/auth";
import { tokenStorage } from "../lib/apiClient";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(tokenStorage.getAccess()));

  const login = async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    tokenStorage.set(tokens);
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string) => {
    const tokens = await authApi.register(email, password);
    tokenStorage.set(tokens);
    setIsAuthenticated(true);
  };

  const logout = () => {
    tokenStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return ctx;
}
