import { createHash } from 'node:crypto';

/** Fenêtre pour détecter plusieurs GET sur le même `st` (même instance Node) */
const INVOCATION_WINDOW_MS = 15 * 60 * 1000;
const MAX_MAP_ENTRIES = 2000;

type StHitEntry = { count: number; firstSeen: number };

const stHitByHash = new Map<string, StHitEntry>();

function pruneStHitMap(now: number): void {
  for (const [key, entry] of stHitByHash) {
    if (now - entry.firstSeen > INVOCATION_WINDOW_MS) {
      stHitByHash.delete(key);
    }
  }
  while (stHitByHash.size > MAX_MAP_ENTRIES) {
    const first = stHitByHash.keys().next().value;
    if (first === undefined) break;
    stHitByHash.delete(first);
  }
}

/**
 * Empreinte courte du `st` pour corréler les logs sans exposer le secret en prod.
 */
export function hashPortalSt(st: string): string {
  return createHash('sha256').update(st, 'utf8').digest('hex').slice(0, 16);
}

/**
 * Compte les invocations du même `st` sur cette instance (détecte double hit prefetch / refresh).
 */
export function recordPortalStInvocation(stHash: string): {
  invocationIndex: number;
  invocationLabel: 'first' | 'repeat';
} {
  const now = Date.now();
  pruneStHitMap(now);
  let entry = stHitByHash.get(stHash);
  if (!entry || now - entry.firstSeen > INVOCATION_WINDOW_MS) {
    entry = { count: 1, firstSeen: now };
    stHitByHash.set(stHash, entry);
    return { invocationIndex: 1, invocationLabel: 'first' };
  }
  entry.count += 1;
  return { invocationIndex: entry.count, invocationLabel: 'repeat' };
}

export function logPortalBridgeEvent(
  event: string,
  fields: Record<string, string | number | boolean | null | undefined>
): void {
  const line = JSON.stringify({ source: 'auth/bridge', event, ...fields, ts: new Date().toISOString() });
  console.info(line);
}
