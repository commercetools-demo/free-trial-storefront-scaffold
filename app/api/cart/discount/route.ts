import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { addDiscountCode, removeDiscountCode } from '@/lib/ct/cart';
import { mapCart } from '@/lib/mappers/cart';

// POST /api/cart/discount — redeem a discount code
export async function POST(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 400 });
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });
  try {
    const updated = await addDiscountCode(session.cartId, code);
    return NextResponse.json({ cart: mapCart(updated, locale) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid discount code';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// DELETE /api/cart/discount — remove a discount code
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 400 });
  const { discountCodeId } = await req.json();
  if (!discountCodeId) return NextResponse.json({ error: 'discountCodeId required' }, { status: 400 });
  try {
    const updated = await removeDiscountCode(session.cartId, discountCodeId);
    return NextResponse.json({ cart: mapCart(updated, locale) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to remove discount';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
