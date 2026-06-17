import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getApprovalFlowById, approveFlow, rejectFlow } from '@/lib/ct/approvalFlows';

function requireBU(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session.customerId || !session.businessUnitKey) return null;
  return { customerId: session.customerId, businessUnitKey: session.businessUnitKey };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const approvalFlow = await getApprovalFlowById(ctx.customerId, ctx.businessUnitKey, id);
    return NextResponse.json({ approvalFlow });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  let body: { action?: 'approve' | 'reject'; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    let approvalFlow;
    if (body.action === 'approve') {
      approvalFlow = await approveFlow(ctx.customerId, ctx.businessUnitKey, id);
    } else if (body.action === 'reject') {
      approvalFlow = await rejectFlow(ctx.customerId, ctx.businessUnitKey, id, body.reason);
    } else {
      return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
    }
    return NextResponse.json({ approvalFlow });
  } catch (e: unknown) {
    const statusCode = (e as { statusCode?: number }).statusCode;
    if (statusCode === 403) {
      return NextResponse.json({ error: 'You are not allowed to act on this approval flow.' }, { status: 403 });
    }
    const msg = e instanceof Error ? e.message : 'Failed to update approval flow';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
