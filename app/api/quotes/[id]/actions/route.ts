import { NextRequest, NextResponse } from 'next/server';
import { getSession, jsonWithSession } from '@/lib/session';
import {
  changeQuoteState,
  requestQuoteRenegotiation,
  acceptQuoteAndCreateOrder,
} from '@/lib/ct/quotes';

// Buyer actions on a specific Quote round. `id` here is the QUOTE id (not the
// quote-request thread id) — the client passes the latest quote's id.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: quoteId } = await params;
  const { customerId, businessUnitKey } = session;

  let body: { action?: 'accept' | 'decline' | 'renegotiate'; buyerComment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    if (body.action === 'accept') {
      const { orderId } = await acceptQuoteAndCreateOrder(customerId, businessUnitKey, quoteId);
      // Order placed — clear any active cart from the session.
      return jsonWithSession({ orderId }, { ...session, cartId: undefined });
    }
    if (body.action === 'decline') {
      await changeQuoteState(customerId, businessUnitKey, quoteId, 'Declined');
      return NextResponse.json({ ok: true });
    }
    if (body.action === 'renegotiate') {
      if (!body.buyerComment?.trim()) {
        return NextResponse.json({ error: 'A comment is required to renegotiate' }, { status: 400 });
      }
      await requestQuoteRenegotiation(customerId, businessUnitKey, quoteId, body.buyerComment.trim());
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'action must be accept, decline or renegotiate' }, { status: 400 });
  } catch (e: unknown) {
    const statusCode = (e as { statusCode?: number }).statusCode;
    if (statusCode === 403) {
      return NextResponse.json({ error: 'You are not allowed to act on this quote.' }, { status: 403 });
    }
    const msg = e instanceof Error ? e.message : 'Quote action failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
