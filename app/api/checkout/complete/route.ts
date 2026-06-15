import { NextResponse } from 'next/server';
import { getSession, createSessionToken, setSessionCookie } from '@/lib/session';

// Called by the client after commercetools Checkout signals order completion.
// The order is created by commercetools; we just drop the now-ordered cart from the session.
export async function POST() {
  const session = await getSession();
  const token = await createSessionToken({ ...session, cartId: undefined });
  return setSessionCookie(NextResponse.json({ success: true }), token);
}
