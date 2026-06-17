import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COUNTRY_CONFIG, DEFAULT_LOCALE } from '@/lib/utils';
import type { SessionData } from '@/lib/types';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-only-fallback-32-char-key!!!!'
);
const COOKIE_NAME = 'b2b-store-session';

export type Session = SessionData;

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return {};
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const { iat, exp, ...session } = payload as Session & { iat?: number; exp?: number };
    return session;
  } catch {
    return {};
  }
}

export async function getLocale(): Promise<{ country: string; currency: string; locale: string }> {
  const session = await getSession();
  if (session.country && session.currency && session.locale) {
    return { country: session.country, currency: session.currency, locale: session.locale };
  }
  const cookieStore = await cookies();
  // Cookie stores the BCP-47 locale directly (e.g. 'en-US', 'de-DE')
  const locale = cookieStore.get('your-shop-country-locale')?.value || DEFAULT_LOCALE.locale;
  const config = COUNTRY_CONFIG[locale] || COUNTRY_CONFIG[DEFAULT_LOCALE.locale];
  return { country: config.country, currency: config.currency, locale: config.locale };
}

export async function createSessionToken(data: Session): Promise<string> {
  return new SignJWT(data as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
}

export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', maxAge: 0, path: '/' });
  return response;
}

/**
 * Convenience for Route Handlers that need to both persist the session and
 * return JSON: builds the response, signs the token, sets the cookie.
 */
export async function jsonWithSession<T>(data: T, session: Session, status = 200): Promise<NextResponse> {
  const response = NextResponse.json(data, { status });
  const token = await createSessionToken(session);
  return setSessionCookie(response, token);
}
