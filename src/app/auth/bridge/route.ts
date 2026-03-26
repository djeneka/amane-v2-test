import { NextRequest, NextResponse } from 'next/server';
import {
  PORTAL_HANDOFF_COOKIE,
  getPortalBridgeSecret,
  portalConsume,
  resolvePortalTokens,
} from '@/lib/portal-bridge-server';
import { sealPortalPayload } from '@/lib/portal-handoff-crypto';
import {
  hashPortalSt,
  recordPortalStInvocation,
  logPortalBridgeEvent,
} from '@/lib/portal-bridge-log';

export const dynamic = 'force-dynamic';

const DEFAULT_NEXT = '/';
const HANDOFF_MAX_AGE_S = 120;

function getPublicOrigin(request: NextRequest): string {
  const publicBase = process.env.WEB_PUBLIC_BASE_URL?.trim();
  if (publicBase) {
    return publicBase.replace(/\/$/, '');
  }
  return request.nextUrl.origin;
}

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
  const origin = getPublicOrigin(request);

  if (!st?.trim()) {
    logPortalBridgeEvent('missing_st', { next_path: nextPath });
    return NextResponse.redirect(new URL('/auth/bridge/error?reason=missing_st', origin), 302);
  }

  const stTrim = st.trim();
  const stHash = hashPortalSt(stTrim);
  const { invocationIndex, invocationLabel } = recordPortalStInvocation(stHash);

  logPortalBridgeEvent('request_received', {
    st_hash: stHash,
    invocation_index: invocationIndex,
    invocation: invocationLabel,
    next_path: nextPath,
    handoff_cookie_max_age_s: HANDOFF_MAX_AGE_S,
    /** Renseigné côté API si vous exposez expiresAt dans la réponse consume ; sinon null */
    st_expires_at_utc: null,
  });

  if (!secret) {
    logPortalBridgeEvent('config_missing_secret', { st_hash: stHash });
    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth/bridge] PORTAL_BRIDGE_SERVER_SECRET manquant');
    }
    return NextResponse.redirect(new URL('/auth/bridge/error?reason=config', origin), 302);
  }

  try {
    const consumed = await portalConsume(stTrim);
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

    logPortalBridgeEvent('handoff_redirect_ok', {
      st_hash: stHash,
      invocation_index: invocationIndex,
      tokens_from_consume: Boolean(consumed.accessToken && consumed.refreshToken),
      st_expires_at_utc: consumed.expiresAt ?? null,
      st_ttl_seconds: consumed.ttlSeconds ?? null,
    });

    return res;
  } catch (e) {
    const status = (e as Error & { status?: number }).status;
    if (status === 401) {
      logPortalBridgeEvent('consume_401', {
        st_hash: stHash,
        invocation_index: invocationIndex,
        invocation: invocationLabel,
        likely_cause:
          invocationLabel === 'repeat'
            ? 'repeat_hit_same_st_or_refresh'
            : 'expired_invalid_or_single_use_already_consumed',
      });
      return NextResponse.redirect(new URL('/auth/bridge/error?reason=expired', origin), 302);
    }
    logPortalBridgeEvent('consume_or_session_error', {
      st_hash: stHash,
      invocation_index: invocationIndex,
      http_status: status ?? 'unknown',
      ...(process.env.NODE_ENV !== 'production' && e instanceof Error
        ? { error_message: e.message.slice(0, 200) }
        : {}),
    });
    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth/bridge] erreur', e instanceof Error ? e.message : e);
    }
    return NextResponse.redirect(new URL('/auth/bridge/error?reason=server', origin), 302);
  }
}
