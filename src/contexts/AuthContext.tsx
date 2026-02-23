'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login as apiLogin, type AuthUser, type LoginCredentials } from '@/services/auth';
import { getCurrentUser } from '@/services/user';
import { AUTH_UNAUTHORIZED_EVENT } from '@/lib/api';

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
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
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

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<boolean> => {
    try {
      // TODO: brancher sur l'API d'inscription quand disponible
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        phoneNumber: userData.phone,
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        profilePicture: '',
        emailVerified: false,
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wallet: { id: '', balance: 0, currency: 'XOF' },
        score: { score: 0 },
      };
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_USER, JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
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
    register,
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
