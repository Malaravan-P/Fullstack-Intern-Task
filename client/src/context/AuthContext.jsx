import { createContext, useContext, useEffect, useState } from "react";
import api, { request } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so sessions survive reloads.
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // Verify the persisted token against the server whenever it changes so a
  // stale/expired session is cleaned up instead of showing a phantom login.
  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      const res = await request(api.get("/auth/me"));
      if (!alive) return;
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      } else if (res.status === 401) {
        logout();
      }
      // Network errors (status 0) leave the session untouched — the server
      // may simply be down; don't force the user to log in again.
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function login(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  function updateUser(u) {
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
