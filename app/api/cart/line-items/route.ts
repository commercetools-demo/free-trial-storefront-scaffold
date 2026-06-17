import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale, withSession } from '@/lib/session';
import { createCart, addLineItem, removeLineItem, changeLineItemQuantity } from '@/lib/ct/cart';
import { mapCart } from '@/lib/mappers/cart';

// POST /api/cart/line-items — add (creates a cart on demand)
export async function POST(req: NextRequest) {
  const session = await getSession();
  const { locale, currency, country } = await getLocale();
  const { productId, variantId, quantity } = await req.json();
  if (!productId || !variantId) {
    return NextResponse.json({ error: 'productId and variantId required' }, { status: 400 });
  }

  let cartId = session.cartId;
  let needsSessionWrite = false;
  if (!cartId) {
    const ct = await createCart(currency, country, session.customerId, session.customerEmail);
    cartId = ct.id;
    needsSessionWrite = true;
  }

  try {
    const updated = await addLineItem(cartId, productId, variantId, quantity ?? 1);
    const payload = { cart: mapCart(updated, locale) };
    return needsSessionWrite ? withSession({ ...session, cartId }, payload) : NextResponse.json(payload);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to add item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/cart/line-items — change quantity
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 400 });
  const { lineItemId, quantity } = await req.json();
  if (!lineItemId || quantity == null) {
    return NextResponse.json({ error: 'lineItemId and quantity required' }, { status: 400 });
  }
  try {
    const updated = await changeLineItemQuantity(session.cartId, lineItemId, quantity);
    return NextResponse.json({ cart: mapCart(updated, locale) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/cart/line-items — remove
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 400 });
  const { lineItemId } = await req.json();
  if (!lineItemId) return NextResponse.json({ error: 'lineItemId required' }, { status: 400 });
  try {
    const updated = await removeLineItem(session.cartId, lineItemId);
    return NextResponse.json({ cart: mapCart(updated, locale) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to remove item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
