import { NextRequest } from 'next/server';
import { getSession, withSession } from '@/lib/session';
import { COUNTRY_CONFIG } from '@/lib/utils';

// POST /api/locale — { locale } (BCP-47 key from COUNTRY_CONFIG). Resets cart on currency change.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const { locale } = await req.json();
  const config = COUNTRY_CONFIG[locale];
  if (!config) return withSession(session, { error: 'Unsupported locale' }, 400);

  const currencyChanged = session.currency && session.currency !== config.currency;
  const next = {
    ...session,
    country: config.country,
    currency: config.currency,
    locale: config.locale,
    // A cart is bound to one currency — drop it when currency changes.
    ...(currencyChanged ? { cartId: undefined } : {}),
  };
  return withSession(next, {
    country: config.country,
    currency: config.currency,
    locale: config.locale,
  });
}
