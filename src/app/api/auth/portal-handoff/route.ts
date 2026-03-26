import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PORTAL_HANDOFF_COOKIE, getPortalBridgeSecret } from '@/lib/portal-bridge-server';
import { unsealPortalPayload } from '@/lib/portal-handoff-crypto';

export const dynamic = 'force-dynamic';

type Payload = { accessToken: string; refreshToken: string };

function jsonWithCookie(
  body: object,
  status: number,
  clearHandoff: boolean
): NextResponse {
  const res = NextResponse.json(body, { status });
  if (clearHandoff) res.cookies.delete(PORTAL_HANDOFF_COOKIE);
  return res;
}

export async function GET() {
  const secret = getPortalBridgeSecret();
  if (!secret) {
    return jsonWithCookie({ error: 'Configuration serveur incomplète' }, 503, false);
  }

  const jar = await cookies();
  const raw = jar.get(PORTAL_HANDOFF_COOKIE)?.value;
  if (!raw) {
    return jsonWithCookie({ error: 'Session portail absente ou expirée' }, 401, false);
  }

  const plain = unsealPortalPayload(raw, secret);
  if (!plain) {
    return jsonWithCookie({ error: 'Jeton portail invalide' }, 401, true);
  }

  let data: Payload;
  try {
    data = JSON.parse(plain) as Payload;
  } catch {
    return jsonWithCookie({ error: 'Payload invalide' }, 400, true);
  }

  if (!data.accessToken || !data.refreshToken) {
    return jsonWithCookie({ error: 'Réponse portail incomplète' }, 400, true);
  }

  return jsonWithCookie(
    {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    },
    200,
    true
  );
}
