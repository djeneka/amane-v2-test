'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const { isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Ne pas rediriger avant d'avoir lu le statut d'auth (localStorage)
    if (!authReady) return;

    // Si l'authentification est requise et l'utilisateur n'est pas connecté
    if (requireAuth && !isAuthenticated) {
      router.push('/connexion');
      return;
    }

    // Si l'utilisateur est connecté sur connexion/inscription, on ne redirige plus :
    // la page affichera un message "Déjà connecté" pour permettre d'y accéder (ex. changer de compte).
  }, [authReady, isAuthenticated, requireAuth, redirectTo, router, pathname]);

  return <>{children}</>;
} 