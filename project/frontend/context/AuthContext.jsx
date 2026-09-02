'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, tokenStore } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while we check for an existing session

  // On first load, if a token is stored, confirm it's still valid via GET /auth/me.
  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      const token = tokenStore.get();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        if (!cancelled) setUser(res.data.user);
      } catch {
        tokenStore.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = useCallback((data) => {
    tokenStore.set(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({ email, password });
      applySession(res.data);
      return res.data.user;
    },
    [applySession]
  );

  const register = useCallback(
    async ({ name, email, password, role }) => {
      const res = await authApi.register({ name, email, password, role });
      applySession(res.data);
      return res.data.user;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // even if the network call fails, clear the local session
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshMe, updateUser }),
    [user, isLoading, login, register, logout, refreshMe, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
