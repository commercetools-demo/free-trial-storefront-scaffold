import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  getApprovalRuleById,
  updateApprovalRule,
  deactivateApprovalRule,
  type ApprovalRuleInput,
} from '@/lib/ct/approvalRules';

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
    const approvalRule = await getApprovalRuleById(ctx.customerId, ctx.businessUnitKey, id);
    return NextResponse.json({ approvalRule });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  let input: ApprovalRuleInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const current = await getApprovalRuleById(ctx.customerId, ctx.businessUnitKey, id);
    const approvalRule = await updateApprovalRule(
      ctx.customerId,
      ctx.businessUnitKey,
      id,
      current.version,
      input
    );
    return NextResponse.json({ approvalRule });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update approval rule';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// commercetools approval rules cannot be deleted — deactivate (status: Inactive).
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const current = await getApprovalRuleById(ctx.customerId, ctx.businessUnitKey, id);
    const approvalRule = await deactivateApprovalRule(
      ctx.customerId,
      ctx.businessUnitKey,
      id,
      current.version
    );
    return NextResponse.json({ approvalRule });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to deactivate approval rule';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
