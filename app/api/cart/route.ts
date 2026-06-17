import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCart } from '@/lib/ct/cart';

export async function GET() {
  const session = await getSession();
  if (!session.customerId || !session.cartId || !session.businessUnitKey) {
    return NextResponse.json({ cart: null });
  }
  try {
    const cart = await getCart(
      session.cartId,
      session.customerId,
      session.businessUnitKey,
      session.locale
    );
    return NextResponse.json({ cart });
  } catch {
    // Stale or inaccessible cart id — client clears it.
    return NextResponse.json({ cart: null });
  }
}
