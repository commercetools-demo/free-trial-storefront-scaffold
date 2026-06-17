import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCart, setCartAddresses } from '@/lib/ct/cart';
import type { Address } from '@/lib/types';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.cartId) return NextResponse.json({ error: 'No active cart' }, { status: 400 });

  let body: { shippingAddress?: Address; billingAddress?: Address };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body.shippingAddress) {
    return NextResponse.json({ error: 'A shipping address is required' }, { status: 400 });
  }

  try {
    const current = await getCart(session.cartId, session.customerId, session.businessUnitKey, session.locale);
    const cart = await setCartAddresses(
      session.cartId,
      current.version,
      body.shippingAddress,
      body.billingAddress,
      session.customerId,
      session.businessUnitKey,
      session.locale
    );
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to set addresses';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
