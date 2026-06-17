import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPurchaseLists, createPurchaseList } from '@/lib/ct/purchaseLists';

function requireBU(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session.customerId || !session.businessUnitKey || !session.storeKey) return null;
  return {
    customerId: session.customerId,
    businessUnitKey: session.businessUnitKey,
    storeKey: session.storeKey,
    locale: session.locale,
  };
}

export async function GET() {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const purchaseLists = await getPurchaseLists(ctx.customerId, ctx.businessUnitKey, ctx.locale);
    return NextResponse.json({ purchaseLists });
  } catch (e) {
    const statusCode = (e as { statusCode?: number }).statusCode;
    if (statusCode === 403) return NextResponse.json({ purchaseLists: [] });
    return NextResponse.json({ error: 'Failed to load purchase lists' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { name?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  try {
    const purchaseList = await createPurchaseList(
      ctx.customerId,
      ctx.businessUnitKey,
      ctx.storeKey,
      ctx.customerId,
      body.name.trim(),
      body.description?.trim(),
      ctx.locale ?? 'en-US'
    );
    return NextResponse.json({ purchaseList });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create purchase list';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
