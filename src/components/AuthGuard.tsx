'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  redirectTo = '/' 
}: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si l'authentification est requise et l'utilisateur n'est pas connecté
    if (requireAuth && !isAuthenticated) {
      router.push('/connexion');
      return;
    }

    // Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth
    if (isAuthenticated && (window.location.pathname === '/connexion' || window.location.pathname === '/inscription')) {
      router.push(redirectTo);
      return;
    }
  }, [isAuthenticated, requireAuth, redirectTo, router]);

  return <>{children}</>;
} 