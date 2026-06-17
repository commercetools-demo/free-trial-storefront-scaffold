import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPurchaseListById, deletePurchaseList } from '@/lib/ct/purchaseLists';

function requireBU(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session.customerId || !session.businessUnitKey) return null;
  return { customerId: session.customerId, businessUnitKey: session.businessUnitKey, locale: session.locale };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const purchaseList = await getPurchaseListById(ctx.customerId, ctx.businessUnitKey, id, ctx.locale);
    return NextResponse.json({ purchaseList });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const current = await getPurchaseListById(ctx.customerId, ctx.businessUnitKey, id, ctx.locale);
    await deletePurchaseList(ctx.customerId, ctx.businessUnitKey, id, current.version);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to delete purchase list';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
