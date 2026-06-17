import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCart, setShippingMethod } from '@/lib/ct/cart';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.cartId) return NextResponse.json({ error: 'No active cart' }, { status: 400 });

  const { shippingMethodId } = await req.json();
  if (!shippingMethodId) {
    return NextResponse.json({ error: 'shippingMethodId is required' }, { status: 400 });
  }

  try {
    const current = await getCart(session.cartId, session.customerId, session.businessUnitKey, session.locale);
    const cart = await setShippingMethod(
      session.cartId,
      current.version,
      shippingMethodId,
      session.customerId,
      session.businessUnitKey,
      session.locale
    );
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to set shipping method';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
