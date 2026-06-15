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
  setShippingAddress,
  setBillingAddress,
  setShippingMethod,
  setCustomerEmail,
} from '@/lib/ct/cart';
import { mapCart } from '@/lib/mappers/cart';
import type { BaseAddress } from '@commercetools/platform-sdk';

export async function GET() {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ cart: null });
  try {
    const cart = await getCart(session.cartId);
    if (cart.cartState && cart.cartState !== 'Active') {
      const token = await createSessionToken({ ...session, cartId: undefined });
      return setSessionCookie(NextResponse.json({ cart: null }), token);
    }
    return NextResponse.json({ cart: mapCart(cart, locale) });
  } catch {
    const token = await createSessionToken({ ...session, cartId: undefined });
    return setSessionCookie(NextResponse.json({ cart: null }), token);
  }
}

// Create an empty cart for the current market.
export async function POST() {
  const session = await getSession();
  const { locale, currency, country } = await getLocale();
  const cart = await createCart(currency, country, session.customerId);
  const token = await createSessionToken({ ...session, cartId: cart.id });
  return setSessionCookie(NextResponse.json({ cart: mapCart(cart, locale) }), token);
}

// Update addresses and/or shipping method on the active cart.
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ error: 'No active cart' }, { status: 400 });

  const body = await req.json();
  try {
    let cart = await getCart(session.cartId);

    if (body.shippingAddress) {
      cart = await setShippingAddress(cart.id, cart.version, body.shippingAddress as BaseAddress);
    }
    if (body.billingAddress) {
      cart = await setBillingAddress(cart.id, cart.version, body.billingAddress as BaseAddress);
    }
    if (body.shippingMethodId) {
      cart = await setShippingMethod(cart.id, cart.version, body.shippingMethodId);
    }
    if (body.email) {
      cart = await setCustomerEmail(cart.id, cart.version, body.email);
    }
    return NextResponse.json({ cart: mapCart(cart, locale) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
