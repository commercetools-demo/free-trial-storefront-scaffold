import { NextRequest, NextResponse } from 'next/server';
import { getSession, jsonWithSession } from '@/lib/session';
import { getCart } from '@/lib/ct/cart';
import { createQuoteRequestFromCart } from '@/lib/ct/quotes';

// Create a QuoteRequest from the active cart. commercetools requires the cart
// to have a shipping address — the error is surfaced to the buyer if missing.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.cartId) return NextResponse.json({ error: 'No active cart' }, { status: 400 });

  let comment: string | undefined;
  try {
    comment = (await req.json().catch(() => ({}))).comment;
  } catch {
    comment = undefined;
  }

  try {
    const cart = await getCart(session.cartId, session.customerId, session.businessUnitKey, session.locale);
    const quoteRequest = await createQuoteRequestFromCart(
      session.customerId,
      session.businessUnitKey,
      cart.id,
      cart.version,
      comment
    );
    // Quote request consumes the cart — clear it from the session.
    return jsonWithSession({ quoteRequestId: quoteRequest.id }, { ...session, cartId: undefined });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create quote request';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
