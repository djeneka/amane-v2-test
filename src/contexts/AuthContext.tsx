'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login as apiLogin, type AuthUser, type LoginCredentials } from '@/services/auth';
import { getCurrentUser } from '@/services/user';
import { AUTH_UNAUTHORIZED_EVENT } from '@/lib/api';
import { LOCALE_STORAGE_KEY } from '@/i18n/config';

const STORAGE_USER = 'amane-user';
const STORAGE_ACCESS_TOKEN = 'amane-access-token';
const STORAGE_REFRESH_TOKEN = 'amane-refresh-token';

export type User = AuthUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** True une fois que le localStorage a été lu (évite redirections incorrectes au premier rendu) */
  authReady: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  /** Rafraîchit l'utilisateur depuis GET /api/users/me (solde, score, etc.) */
  refreshUser: () => Promise<void>;
  /** Token pour les appels API authentifiés */
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const refreshUser = async () => {
    const token = localStorage.getItem(STORAGE_ACCESS_TOKEN);
    if (!token) return;
    try {
      const freshUser = await getCurrentUser(token);
      setUser(freshUser);
      localStorage.setItem(STORAGE_USER, JSON.stringify(freshUser));
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de l\'utilisateur:', error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const savedUser = localStorage.getItem(STORAGE_USER);
    const savedToken = localStorage.getItem(STORAGE_ACCESS_TOKEN);
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser) as User;
        setUser(userData);
        setAccessToken(savedToken);
        setIsAuthenticated(true);
        getCurrentUser(savedToken)
          .then((freshUser) => {
            if (!cancelled) {
              setUser(freshUser);
              localStorage.setItem(STORAGE_USER, JSON.stringify(freshUser));
            }
          })
          .catch((err) => {
            if (!cancelled) console.error('Erreur GET /api/users/me:', err);
          });
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem(STORAGE_USER);
        localStorage.removeItem(STORAGE_ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_REFRESH_TOKEN);
      }
    }
    setAuthReady(true);
    return () => { cancelled = true; };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const res = await apiLogin(credentials);
      setUser(res.user);
      setAccessToken(res.accessToken);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_USER, JSON.stringify(res.user));
      localStorage.setItem(STORAGE_ACCESS_TOKEN, res.accessToken);
      localStorage.setItem(STORAGE_REFRESH_TOKEN, res.refreshToken);
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN);
    localStorage.removeItem(LOCALE_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  }, []);

  // Déconnexion automatique quand une requête API retourne 401 (storage déjà nettoyé par api.ts)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onUnauthorized = () => {
      logout();
      window.location.href = '/';
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    authReady,
    login,
    logout,
    refreshUser,
    accessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
