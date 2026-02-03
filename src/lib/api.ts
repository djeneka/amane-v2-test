/**
 * Client API pour les appels au backend.
 * Base URL : NEXT_PUBLIC_API_URL (ex. http://localhost:8000)
 */

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? '';
  }
  return process.env.NEXT_PUBLIC_API_URL ?? '';
};

export async function apiGet<T>(path: string): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
