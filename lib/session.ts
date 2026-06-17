import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COUNTRY_CONFIG, DEFAULT_LOCALE } from '@/lib/utils';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-only-fallback-32-char-key!!'
);
const COOKIE_NAME = 'my-brand-session';

export interface Session {
  customerId?: string;
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
  cartId?: string;
  country?: string;
  currency?: string;
  locale?: string;
}

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return {};
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const { iat, exp, ...session } = payload as Session & { iat?: number; exp?: number };
    void iat;
    void exp;
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
  // Cookie stores the BCP-47 locale directly (e.g. 'en-US', 'de-DE') — same as COUNTRY_CONFIG key
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

/** Persist a (possibly updated) session onto a JSON NextResponse and return it. */
export async function withSession(data: Session, body: unknown, status = 200): Promise<NextResponse> {
  const res = NextResponse.json(body, { status });
  const token = await createSessionToken(data);
  return setSessionCookie(res, token);
}
