import { NextRequest, NextResponse } from 'next/server';
import {
  PORTAL_HANDOFF_COOKIE,
  getPortalBridgeSecret,
  portalConsume,
  resolvePortalTokens,
} from '@/lib/portal-bridge-server';
import { sealPortalPayload } from '@/lib/portal-handoff-crypto';

export const dynamic = 'force-dynamic';

const DEFAULT_NEXT = '/don';
const HANDOFF_MAX_AGE_S = 120;

function sanitizeNext(next: string | null): string {
  if (!next || typeof next !== 'string') return DEFAULT_NEXT;
  const trimmed = next.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return DEFAULT_NEXT;
  return trimmed;
}

export async function GET(request: NextRequest) {
  const st = request.nextUrl.searchParams.get('st');
  const nextPath = sanitizeNext(request.nextUrl.searchParams.get('next'));
  const secret = getPortalBridgeSecret();
  const origin = request.nextUrl.origin;

  if (!st?.trim()) {
    return NextResponse.redirect(new URL('/auth/bridge/error?reason=missing_st', origin), 302);
  }

  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth/bridge] PORTAL_BRIDGE_SERVER_SECRET manquant');
    }
    return NextResponse.redirect(new URL('/auth/bridge/error?reason=config', origin), 302);
  }

  try {
    const consumed = await portalConsume(st.trim());
    const tokens = await resolvePortalTokens(consumed);

    const payload = JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    const sealed = sealPortalPayload(payload, secret);

    const res = NextResponse.redirect(new URL(`/auth/handoff?next=${encodeURIComponent(nextPath)}`, origin), 302);
    res.cookies.set(PORTAL_HANDOFF_COOKIE, sealed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: HANDOFF_MAX_AGE_S,
    });
    return res;
  } catch (e) {
    const status = (e as Error & { status?: number }).status;
    if (status === 401) {
      return NextResponse.redirect(new URL('/auth/bridge/error?reason=expired', origin), 302);
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth/bridge] erreur', e instanceof Error ? e.message : e);
    }
    return NextResponse.redirect(new URL('/auth/bridge/error?reason=server', origin), 302);
  }
}
