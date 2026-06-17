import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getBusinessUnitByKey, addBusinessUnitAddress } from '@/lib/ct/businessUnits';
import type { Address } from '@/lib/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await getSession();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { key } = await params;

  let address: Address;
  try {
    address = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!address.country) {
    return NextResponse.json({ error: 'Country is required' }, { status: 400 });
  }

  try {
    const current = await getBusinessUnitByKey(key);
    const businessUnit = await addBusinessUnitAddress(key, current.version, address);
    return NextResponse.json({ businessUnit });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to add address';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
