import type { AuthUser } from '@/services/auth';

export const PORTAL_HANDOFF_COOKIE = 'amane_portal_handoff';

export function getServerApiBase(): string {
  const raw =
    process.env.AMANE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    '';
  return raw.replace(/\/$/, '');
}

export function getPortalBridgeSecret(): string | undefined {
  const s = process.env.PORTAL_BRIDGE_SERVER_SECRET?.trim();
  return s || undefined;
}

/** Chemin API pour obtenir access/refresh après consume si la réponse ne les contient pas */
export function getWebPortalSessionPath(): string {
  const p = process.env.AMANE_WEB_PORTAL_SESSION_PATH?.trim();
  if (p) return p.startsWith('/') ? p : `/${p}`;
  return '/api/auth/web-portal/issue-web-session';
}

export type PortalTokens = { accessToken: string; refreshToken: string };

export type ConsumeApiResponse = {
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
};

function joinApiUrl(base: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export async function portalConsume(st: string): Promise<ConsumeApiResponse> {
  const base = getServerApiBase();
  const secret = getPortalBridgeSecret();
  if (!base) throw new Error('AMANE_API_URL ou NEXT_PUBLIC_API_URL manquant');
  if (!secret) throw new Error('PORTAL_BRIDGE_SERVER_SECRET manquant');

  const url = joinApiUrl(base, '/api/auth/web-portal/consume');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Portal-Bridge-Secret': secret,
    },
    body: JSON.stringify({ st }),
  });

  if (res.status === 401) {
    const err = new Error('PORTAL_CONSUME_UNAUTHORIZED');
    (err as Error & { status?: number }).status = 401;
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(text || `consume HTTP ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  return (await res.json()) as ConsumeApiResponse;
}

/**
 * Demande des jetons web pour un userId (serveur à serveur).
 * À exposer côté API si consume ne renvoie que userId.
 */
export async function portalIssueWebSession(userId: string): Promise<PortalTokens> {
  const base = getServerApiBase();
  const secret = getPortalBridgeSecret();
  if (!base) throw new Error('AMANE_API_URL ou NEXT_PUBLIC_API_URL manquant');
  if (!secret) throw new Error('PORTAL_BRIDGE_SERVER_SECRET manquant');

  const path = getWebPortalSessionPath();
  const url = joinApiUrl(base, path);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Portal-Bridge-Secret': secret,
    },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(text || `issue-web-session HTTP ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const data = (await res.json()) as Partial<PortalTokens>;
  if (!data.accessToken || !data.refreshToken) {
    throw new Error('Réponse issue-web-session invalide: accessToken/refreshToken manquants');
  }
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

export async function resolvePortalTokens(consume: ConsumeApiResponse): Promise<PortalTokens> {
  if (consume.accessToken && consume.refreshToken) {
    return { accessToken: consume.accessToken, refreshToken: consume.refreshToken };
  }
  return portalIssueWebSession(consume.userId);
}
