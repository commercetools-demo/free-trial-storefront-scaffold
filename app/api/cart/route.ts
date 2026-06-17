import { NextResponse } from 'next/server';
import { getSession, getLocale, withSession } from '@/lib/session';
import { getCart, createCart } from '@/lib/ct/cart';
import { mapCart } from '@/lib/mappers/cart';

// GET /api/cart — current active cart (with session hygiene)
export async function GET() {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ cart: null });

  try {
    const ct = await getCart(session.cartId);
    if (ct.cartState !== 'Active') {
      const { cartId, ...rest } = session;
      void cartId;
      return withSession(rest, { cart: null });
    }
    return NextResponse.json({ cart: mapCart(ct, locale) });
  } catch {
    const { cartId, ...rest } = session;
    void cartId;
    return withSession(rest, { cart: null });
  }
}

// POST /api/cart — create an (empty) cart on demand
export async function POST() {
  const session = await getSession();
  const { locale, currency, country } = await getLocale();
  if (session.cartId) {
    try {
      const existing = await getCart(session.cartId);
      if (existing.cartState === 'Active') return NextResponse.json({ cart: mapCart(existing, locale) });
    } catch {
      /* fall through to create */
    }
  }
  const ct = await createCart(currency, country, session.customerId, session.customerEmail);
  return withSession({ ...session, cartId: ct.id }, { cart: mapCart(ct, locale) });
}
