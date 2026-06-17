import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPurchaseListById, addPurchaseListItem, removePurchaseListItem } from '@/lib/ct/purchaseLists';

function requireBU(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session.customerId || !session.businessUnitKey) return null;
  return { customerId: session.customerId, businessUnitKey: session.businessUnitKey, locale: session.locale };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  let body: { productId?: string; variantId?: number; quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body.productId || body.variantId == null) {
    return NextResponse.json({ error: 'productId and variantId are required' }, { status: 400 });
  }

  try {
    const current = await getPurchaseListById(ctx.customerId, ctx.businessUnitKey, id, ctx.locale);
    const purchaseList = await addPurchaseListItem(
      ctx.customerId,
      ctx.businessUnitKey,
      id,
      current.version,
      body.productId,
      body.variantId,
      body.quantity ?? 1,
      ctx.locale
    );
    return NextResponse.json({ purchaseList });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to add item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const { lineItemId } = await req.json();
  if (!lineItemId) return NextResponse.json({ error: 'lineItemId is required' }, { status: 400 });

  try {
    const current = await getPurchaseListById(ctx.customerId, ctx.businessUnitKey, id, ctx.locale);
    const purchaseList = await removePurchaseListItem(
      ctx.customerId,
      ctx.businessUnitKey,
      id,
      current.version,
      lineItemId,
      ctx.locale
    );
    return NextResponse.json({ purchaseList });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to remove item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
