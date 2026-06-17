import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getApprovalRules, createApprovalRule, type ApprovalRuleInput } from '@/lib/ct/approvalRules';

function requireBU(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session.customerId || !session.businessUnitKey) return null;
  return { customerId: session.customerId, businessUnitKey: session.businessUnitKey };
}

export async function GET() {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const approvalRules = await getApprovalRules(ctx.customerId, ctx.businessUnitKey);
    return NextResponse.json({ approvalRules });
  } catch (e) {
    const statusCode = (e as { statusCode?: number }).statusCode;
    if (statusCode === 403) return NextResponse.json({ approvalRules: [] });
    return NextResponse.json({ error: 'Failed to load approval rules' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ctx = requireBU(session);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let input: ApprovalRuleInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!input.name || !input.predicate || !input.approverTiers?.length) {
    return NextResponse.json(
      { error: 'name, predicate and at least one approver tier are required' },
      { status: 400 }
    );
  }

  try {
    const approvalRule = await createApprovalRule(ctx.customerId, ctx.businessUnitKey, input);
    return NextResponse.json({ approvalRule });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create approval rule';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
