'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'meetup_rsvp_auth';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setToken(parsed.token || null);
        setUser(parsed.user || null);
      }
    } catch (err) {
      // Corrupt/blocked storage: proceed as logged out.
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function login(email, password) {
    const result = await api.login(email, password);
    setToken(result.token);
    setUser(result.user);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: result.token, user: result.user })
    );
    return result;
  }

  function logout() {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
    router.push('/login');
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), isLoading, login, logout }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return ctx;
}
