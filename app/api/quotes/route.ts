import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getQuoteThreads } from '@/lib/ct/quotes';

export async function GET() {
  const session = await getSession();
  if (!session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const quotes = await getQuoteThreads(session.customerId, session.businessUnitKey, session.locale);
    return NextResponse.json({ quotes });
  } catch (e) {
    const statusCode = (e as { statusCode?: number }).statusCode;
    if (statusCode === 403) return NextResponse.json({ quotes: [] });
    return NextResponse.json({ error: 'Failed to load quotes' }, { status: 500 });
  }
}
