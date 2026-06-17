import { getSession, jsonWithSession } from '@/lib/session';
import type { Session } from '@/lib/session';

export async function POST() {
  const prior = await getSession();
  // Preserve locale/currency/country, strip all user + B2B context fields.
  const session: Session = {
    locale: prior.locale,
    currency: prior.currency,
    country: prior.country,
  };
  return jsonWithSession({ ok: true }, session);
}
