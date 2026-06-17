import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getBusinessUnitsForAssociate } from '@/lib/ct/businessUnits';

export async function GET() {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const businessUnits = await getBusinessUnitsForAssociate(session.customerId);
    return NextResponse.json({ businessUnits });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load business units';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
