import { createContext, useContext } from "react";
import type { AuthUser, LoginRequest } from "./authApi";

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  authError: string | null;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider.");
  }
  return context;
}
