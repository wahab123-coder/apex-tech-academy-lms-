import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking persisted session

  // ── Restore session on mount ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('ata_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('ata_token'))
      .finally(() => setLoading(false));
  }, []);

  // ── Register ───────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const res = await api.post('/auth/register', formData);
    localStorage.setItem('ata_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  // ── Login ──────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('ata_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  // ── Logout ─────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    localStorage.removeItem('ata_token');
    setUser(null);
  }, []);

  // ── Update local user state (after profile edit) ───────
  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin:         user?.role === 'admin',
    isInstructor:    user?.role === 'instructor',
    isStudent:       user?.role === 'student',
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
