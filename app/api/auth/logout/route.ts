import { getSession, withSession } from '@/lib/session';

// POST /api/auth/logout — preserve locale/currency/country, clear user + cart fields
export async function POST() {
  const { country, currency, locale } = await getSession();
  return withSession({ country, currency, locale }, { ok: true });
}
