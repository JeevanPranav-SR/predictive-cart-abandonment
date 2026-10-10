import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  async function signup(body) {
    const data = await api.signup(body);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function login(body) {
    const data = await api.login(body);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      // Local logout still clears the session.
    }
    setToken("");
    setUser(null);
  }

  const value = useMemo(() => ({ user, ready, signup, login, logout }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
