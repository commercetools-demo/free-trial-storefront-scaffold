import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSessionToken, setSessionCookie, LOCALE_COOKIE } from '@/lib/session';
import { COUNTRY_CONFIG } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  const config = COUNTRY_CONFIG[locale];
  if (!config) return NextResponse.json({ error: 'Unknown locale' }, { status: 400 });

  const session = await getSession();
  // Changing market resets the cart (currency/country bound to the cart).
  const token = await createSessionToken({
    ...session,
    locale: config.locale,
    currency: config.currency,
    country: config.country,
    cartId: undefined,
  });
  const res = NextResponse.json({
    locale: config.locale,
    currency: config.currency,
    country: config.country,
  });
  setSessionCookie(res, token);
  res.cookies.set(LOCALE_COOKIE, config.locale, { path: '/', maxAge: 365 * 24 * 60 * 60 });
  return res;
}
