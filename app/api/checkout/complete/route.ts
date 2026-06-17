import { getSession, jsonWithSession } from '@/lib/session';

// Called by the payment step when the Checkout SDK signals completion.
// Clears cartId from the session so a fresh cart is created next time.
export async function POST() {
  const session = await getSession();
  return jsonWithSession({ ok: true }, { ...session, cartId: undefined });
}
