import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getApprovalFlows } from '@/lib/ct/approvalFlows';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  try {
    const approvalFlows = await getApprovalFlows(session.customerId, session.businessUnitKey, status);
    return NextResponse.json({ approvalFlows, total: approvalFlows.length });
  } catch (e) {
    const statusCode = (e as { statusCode?: number }).statusCode;
    // 403 = associate lacks UpdateApprovalFlows — return empty list, not an error.
    if (statusCode === 403) return NextResponse.json({ approvalFlows: [], total: 0 });
    return NextResponse.json({ error: 'Failed to load approval flows' }, { status: 500 });
  }
}
