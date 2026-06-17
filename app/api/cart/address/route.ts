import { NextRequest, NextResponse } from 'next/server';
import type { BaseAddress } from '@commercetools/platform-sdk';
import { getSession, getLocale } from '@/lib/session';
import { setShippingAddress, setBillingAddress } from '@/lib/ct/cart';
import { mapCart } from '@/lib/mappers/cart';

// PATCH /api/cart/address — set shipping and/or billing address on the cart
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 400 });
  const { shippingAddress, billingAddress } = (await req.json()) as {
    shippingAddress?: BaseAddress;
    billingAddress?: BaseAddress;
  };
  try {
    let updated;
    if (shippingAddress) updated = await setShippingAddress(session.cartId, shippingAddress);
    if (billingAddress) updated = await setBillingAddress(session.cartId, billingAddress);
    if (!updated) return NextResponse.json({ error: 'No address provided' }, { status: 400 });
    return NextResponse.json({ cart: mapCart(updated, locale) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to set address';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
