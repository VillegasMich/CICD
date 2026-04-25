import { createContext, useContext, useEffect, useRef, useState } from "react";
import { configureApi } from "../api/client";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);
const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    configureApi({
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        setToken(null);
        setUser(null);
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async ({ email, password }) => {
    const { access_token } = await authApi.login({ email, password });
    setToken(access_token);
    tokenRef.current = access_token;
    const me = await authApi.fetchMe();
    setUser(me);
    return me;
  };

  const register = async ({ name, email, password }) => {
    await authApi.register({ name, email, password });
    return login({ email, password });
  };

  const value = { user, token, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
