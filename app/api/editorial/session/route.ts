/**
 * app/api/editorial/session/route.ts
 *
 * Sign in, check, sign out for the web editor.
 *
 *   POST   { password }  -> sets the session cookie
 *   GET                  -> { signedIn: boolean }
 *   DELETE               -> clears the cookie
 */

import { NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  clearFailures,
  getConfig,
  issue,
  pause,
  recordFailure,
  safeEqual,
  throttled,
  verify,
} from '@/lib/editorial/session';

export const dynamic = 'force-dynamic';

function clientKey(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function GET(request: Request) {
  const cfg = getConfig();
  if (!cfg) return NextResponse.json({ signedIn: false, configured: false });
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  return NextResponse.json({ signedIn: verify(cookie, cfg.secret), configured: true });
}

export async function POST(request: Request) {
  const cfg = getConfig();
  if (!cfg) {
    return NextResponse.json(
      {
        error:
          'The editor is not configured on this deployment. EDITOR_PASSWORD and EDITOR_SECRET must be set.',
        configured: false,
      },
      { status: 503 },
    );
  }

  const key = clientKey(request);
  if (throttled(key)) {
    await pause();
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429 },
    );
  }

  let password = '';
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === 'string') password = body.password;
  } catch {
    /* fall through to the uniform failure path */
  }

  if (!password || !safeEqual(password, cfg.password)) {
    recordFailure(key);
    await pause();
    return NextResponse.json({ error: 'That password is not right.' }, { status: 401 });
  }

  clearFailures(key);
  const { value, maxAge } = issue(cfg.secret);
  const res = NextResponse.json({ signedIn: true });
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ signedIn: false });
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
