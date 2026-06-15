import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  getLocale,
  createSessionToken,
  setSessionCookie,
} from '@/lib/session';
import {
  getCart,
  createCart,
  addLineItem,
  addLineItemBySku,
  removeLineItem,
  changeLineItemQuantity,
} from '@/lib/ct/cart';
import { mapCart } from '@/lib/mappers/cart';

// Add an item — creates the cart on demand when none exists.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const { locale, currency, country } = await getLocale();
  const { productId, variantId, sku, quantity = 1 } = await req.json();

  try {
    let cartId = session.cartId;
    let needCookie = false;
    if (!cartId) {
      const created = await createCart(currency, country, session.customerId);
      cartId = created.id;
      needCookie = true;
    }

    let cart = await getCart(cartId);
    cart = sku
      ? await addLineItemBySku(cart.id, cart.version, sku, quantity)
      : await addLineItem(cart.id, cart.version, productId, variantId ?? 1, quantity);

    const res = NextResponse.json({ cart: mapCart(cart, locale) });
    if (needCookie) {
      const token = await createSessionToken({ ...session, cartId });
      setSessionCookie(res, token);
    }
    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ cart: null });
  const { lineItemId } = await req.json();
  try {
    const current = await getCart(session.cartId);
    const cart = await removeLineItem(current.id, current.version, lineItemId);
    return NextResponse.json({ cart: mapCart(cart, locale) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ cart: null });
  const { lineItemId, quantity } = await req.json();
  try {
    const current = await getCart(session.cartId);
    const cart = await changeLineItemQuantity(current.id, current.version, lineItemId, quantity);
    return NextResponse.json({ cart: mapCart(cart, locale) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
