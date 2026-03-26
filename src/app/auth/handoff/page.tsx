'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/services/user';
import {
  AUTH_STORAGE_ACCESS_TOKEN,
  AUTH_STORAGE_REFRESH_TOKEN,
  AUTH_STORAGE_USER,
} from '@/lib/auth-storage-keys';

const DEFAULT_NEXT = '/';

function sanitizeNext(raw: string | null): string {
  if (!raw || typeof raw !== 'string') return DEFAULT_NEXT;
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return DEFAULT_NEXT;
    return decoded;
  } catch {
    return DEFAULT_NEXT;
  }
}

function HandoffInner() {
  const searchParams = useSearchParams();
  const nextPath = sanitizeNext(searchParams.get('next'));
  const [message, setMessage] = useState('Connexion depuis l’application…');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const existingAccessToken = localStorage.getItem(AUTH_STORAGE_ACCESS_TOKEN);
        const existingRefreshToken = localStorage.getItem(AUTH_STORAGE_REFRESH_TOKEN);
        if (existingAccessToken && existingRefreshToken) {
          if (!cancelled) window.location.assign(nextPath);
          return;
        }

        const res = await fetch('/api/auth/portal-handoff', {
          credentials: 'include',
        });
        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          const stillHasTokens =
            Boolean(localStorage.getItem(AUTH_STORAGE_ACCESS_TOKEN)) &&
            Boolean(localStorage.getItem(AUTH_STORAGE_REFRESH_TOKEN));
          if (stillHasTokens) {
            if (!cancelled) window.location.assign(nextPath);
            return;
          }
          if (!cancelled) {
            setMessage(
              typeof body.error === 'string'
                ? body.error
                : 'Impossible de finaliser la connexion. Réessayez depuis l’app.'
            );
          }
          return;
        }

        const accessToken = body.accessToken as string | undefined;
        const refreshToken = body.refreshToken as string | undefined;
        if (!accessToken || !refreshToken) {
          if (!cancelled) setMessage('Réponse serveur invalide.');
          return;
        }

        localStorage.setItem(AUTH_STORAGE_ACCESS_TOKEN, accessToken);
        localStorage.setItem(AUTH_STORAGE_REFRESH_TOKEN, refreshToken);

        try {
          const user = await getCurrentUser(accessToken);
          if (!cancelled) localStorage.setItem(AUTH_STORAGE_USER, JSON.stringify(user));
        } catch {
          if (!cancelled) {
            localStorage.removeItem(AUTH_STORAGE_USER);
          }
        }

        if (!cancelled) {
          window.location.assign(nextPath);
        }
      } catch {
        if (!cancelled) setMessage('Une erreur réseau est survenue.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nextPath]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center text-sm text-neutral-700">
      <p className="max-w-md">{message}</p>
    </div>
  );
}

export default function PortalHandoffPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-600">
          Chargement…
        </div>
      }
    >
      <HandoffInner />
    </Suspense>
  );
}
