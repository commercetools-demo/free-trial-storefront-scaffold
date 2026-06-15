import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getCart, addDiscountCode, removeDiscountCode } from '@/lib/ct/cart';
import { mapCart } from '@/lib/mappers/cart';

export async function POST(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  const { code } = await req.json();
  try {
    const current = await getCart(session.cartId);
    const cart = await addDiscountCode(current.id, current.version, code);
    return NextResponse.json({ cart: mapCart(cart, locale) });
  } catch {
    return NextResponse.json({ error: 'That discount code is not valid.' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  const { discountCodeId } = await req.json();
  try {
    const current = await getCart(session.cartId);
    const cart = await removeDiscountCode(current.id, current.version, discountCodeId);
    return NextResponse.json({ cart: mapCart(cart, locale) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
