import { createContext, useContext } from "react";

/**
 * Auth state lives in App.jsx (it owns `auth` / `setAuth`). App provides this
 * context so any component can read the session or start a login through the
 * single shared `loginWithCredentials` function.
 */
export const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = {
  userEmail: "ziyad@gmail.com",
  password: "ziyad@gmail.com",
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthContext.Provider");
  }
  return context;
}
