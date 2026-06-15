import { NextResponse } from 'next/server';
import { getSession, createSessionToken, setSessionCookie } from '@/lib/session';

export async function POST() {
  const session = await getSession();
  const res = NextResponse.json({ success: true });
  // Preserve locale/currency/country — clear all user fields.
  const token = await createSessionToken({
    locale: session.locale,
    currency: session.currency,
    country: session.country,
  });
  return setSessionCookie(res, token);
}
