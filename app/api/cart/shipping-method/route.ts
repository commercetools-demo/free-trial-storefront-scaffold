import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { setShippingMethod } from '@/lib/ct/cart';
import { mapCart } from '@/lib/mappers/cart';

// PATCH /api/cart/shipping-method — select a shipping method
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 400 });
  const { shippingMethodId } = await req.json();
  if (!shippingMethodId) return NextResponse.json({ error: 'shippingMethodId required' }, { status: 400 });
  try {
    const updated = await setShippingMethod(session.cartId, shippingMethodId);
    return NextResponse.json({ cart: mapCart(updated, locale) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to set shipping method';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
