import { NextRequest, NextResponse } from 'next/server';
import { COUNTRY_CONFIG, DEFAULT_LOCALE } from '@/lib/utils';

const LOCALES = Object.keys(COUNTRY_CONFIG);
const DEFAULT_LOCALE_STRING = DEFAULT_LOCALE.locale; // 'en-US'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const matchedLocale = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (matchedLocale) {
    const needsSync = request.cookies.get('your-shop-country-locale')?.value !== matchedLocale;
    // Forward the synced cookie on the request so this same render reads the right
    // currency/country (getLocale falls back to this cookie), then persist it.
    if (needsSync) request.cookies.set('your-shop-country-locale', matchedLocale);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.headers.set('x-next-intl-locale', matchedLocale);
    if (needsSync) {
      response.cookies.set('your-shop-country-locale', matchedLocale, {
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      });
    }
    return response;
  }

  // Cookie stores the BCP-47 locale directly (e.g. 'en-US', 'de-DE')
  const cookieLocale = request.cookies.get('your-shop-country-locale')?.value;
  const locale = (cookieLocale && LOCALES.includes(cookieLocale)) ? cookieLocale : DEFAULT_LOCALE_STRING;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|favicon|.*\\..*).*)', '/'],
};
