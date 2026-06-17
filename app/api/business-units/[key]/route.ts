import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getBusinessUnitByKey, updateBusinessUnitDetails } from '@/lib/ct/businessUnits';

// Update business unit details (name, contact email).
// commercetools enforces UpdateBusinessUnitDetails via the associate's roles.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await getSession();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { key } = await params;

  let body: { name?: string; contactEmail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const current = await getBusinessUnitByKey(key);
    const businessUnit = await updateBusinessUnitDetails(key, current.version, body);
    return NextResponse.json({ businessUnit });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update business unit';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
