/**
 * Client API pour les appels au backend.
 * Base URL : NEXT_PUBLIC_API_URL (ex. http://localhost:8000)
 */

/** Clés de stockage auth (alignées avec AuthContext) */
const STORAGE_USER = 'amane-user';
const STORAGE_ACCESS_TOKEN = 'amane-access-token';
const STORAGE_REFRESH_TOKEN = 'amane-refresh-token';

/** Nom de l'événement émis en cas de 401 pour déconnecter l'utilisateur */
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

/**
 * Indique si une erreur 401 est due à un code wallet incorrect (paiement) plutôt qu'à un token invalide.
 * Dans ce cas, on ne déconnecte pas l'utilisateur.
 */
function isWalletCodeError(responseText: string): boolean {
  const lower = responseText.toLowerCase();
  const hasWalletContext = /wallet|portefeuille|walletcode|wallet_code/.test(lower);
  const hasCodeError = /code.*incorrect|incorrect.*code|invalid.*(code|wallet)|wrong.*(code|wallet)|mauvais.*code|code.*invalid|code.*wrong/.test(lower);
  return hasWalletContext || hasCodeError;
}

/**
 * En cas de 401 : nettoie le storage auth et notifie l'app (AuthProvider écoute et déconnecte).
 * Sauf si l'erreur vient d'un code wallet incorrect lors d'un paiement.
 */
function handleUnauthorized(responseText: string): void {
  if (isWalletCodeError(responseText)) return;
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_USER);
  localStorage.removeItem(STORAGE_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_REFRESH_TOKEN);
  sessionStorage.clear();
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? '';
  }
  return process.env.NEXT_PUBLIC_API_URL ?? '';
};

const getHeaders = (options?: { contentType?: string }) => ({
  accept: 'application/json',
  ...(options?.contentType !== undefined ? { 'Content-Type': options.contentType } : { 'Content-Type': 'application/json' }),
});

export async function apiGet<T>(path: string, options?: { token?: string; cache?: RequestCache }): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...getHeaders() };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const fetchOptions: RequestInit = {
    method: 'GET',
    headers,
  };
  if (options?.cache !== undefined) {
    fetchOptions.cache = options.cache;
  }
  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) handleUnauthorized(text);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, options?: { token?: string }): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...getHeaders() };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) handleUnauthorized(text);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown, options?: { token?: string }): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...getHeaders() };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) handleUnauthorized(text);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string, options?: { token?: string }): Promise<void> {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...getHeaders() };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const res = await fetch(url, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) handleUnauthorized(text);
    throw new Error(text || `HTTP ${res.status}`);
  }
}