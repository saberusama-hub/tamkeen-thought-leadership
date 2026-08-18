/**
 * lib/editorial/session.ts
 *
 * Session handling for the web editor.
 *
 * One shared password, checked in constant time, exchanged for a signed
 * httpOnly cookie. The cookie carries only an expiry timestamp and an HMAC
 * over it, so nothing sensitive rides in the browser and the value cannot be
 * forged without EDITOR_SECRET.
 *
 * Server-only. Never import into a client component.
 */

import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

export const COOKIE_NAME = 'theindex_editor';
export const SESSION_DAYS = 30;

export interface SessionConfig {
  password: string;
  secret: string;
}

/**
 * Reads the editor configuration. Returns null when the deployment has not
 * been given credentials, which is how the routes tell "not set up yet" apart
 * from "wrong password".
 */
export function getConfig(): SessionConfig | null {
  const password = process.env.EDITOR_PASSWORD;
  const secret = process.env.EDITOR_SECRET;
  if (!password || !secret) return null;
  if (password.length < 8) return null;
  return { password, secret };
}

/** Constant-time string comparison that does not leak length through timing. */
export function safeEqual(a: string, b: string): boolean {
  // Hash both sides first so the compared buffers are always the same length;
  // comparing raw strings of different lengths would throw and would also leak
  // the length through the error path.
  const ha = createHmac('sha256', 'compare').update(a).digest();
  const hb = createHmac('sha256', 'compare').update(b).digest();
  return timingSafeEqual(ha, hb);
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Mint a cookie value valid for SESSION_DAYS. */
export function issue(secret: string): { value: string; maxAge: number } {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const expiry = Date.now() + maxAge * 1000;
  const nonce = randomBytes(8).toString('base64url');
  const payload = `${expiry}.${nonce}`;
  return { value: `${payload}.${sign(payload, secret)}`, maxAge };
}

/** Verify a cookie value: signature intact and not expired. */
export function verify(value: string | undefined, secret: string): boolean {
  if (!value) return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [expiry, nonce, mac] = parts;
  const expected = sign(`${expiry}.${nonce}`, secret);
  if (!safeEqual(mac, expected)) return false;
  const ts = Number(expiry);
  return Number.isFinite(ts) && ts > Date.now();
}

/**
 * Best-effort throttle on failed sign-in attempts.
 *
 * Module scope on serverless means this is per-instance and resets on cold
 * start, so it is a speed bump rather than a real limiter. The length of the
 * shared password is the actual control; this only blunts casual guessing.
 */
const attempts = new Map<string, { n: number; until: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export function throttled(key: string): boolean {
  const rec = attempts.get(key);
  if (!rec) return false;
  if (Date.now() > rec.until) {
    attempts.delete(key);
    return false;
  }
  return rec.n >= MAX_ATTEMPTS;
}

export function recordFailure(key: string): void {
  const rec = attempts.get(key);
  if (!rec || Date.now() > rec.until) {
    attempts.set(key, { n: 1, until: Date.now() + WINDOW_MS });
  } else {
    rec.n += 1;
  }
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}

/** Uniform delay on the failure path so timing carries no information. */
export function pause(ms = 250): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
