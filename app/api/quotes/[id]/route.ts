import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getQuoteThreadByRequestId } from '@/lib/ct/quotes';

// `id` is the quote-request id (the thread id).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const quote = await getQuoteThreadByRequestId(session.customerId, session.businessUnitKey, id, session.locale);
    if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
