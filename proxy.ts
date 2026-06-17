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
    const response = NextResponse.next();
    response.headers.set('x-next-intl-locale', matchedLocale);
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
