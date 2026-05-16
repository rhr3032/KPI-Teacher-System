import { createContext, useContext } from "react";

export type UserRole = "admin" | "teacher";

export type AuthSession = {
  role: UserRole;
  name: string;
  email: string;
};

type AuthContextValue = {
  session: AuthSession;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthContext.Provider");
  }

  return context;
}
