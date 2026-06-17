import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAssociateRoles } from '@/lib/ct/associateRoles';

export async function GET() {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const roles = await getAssociateRoles();
    return NextResponse.json({ roles });
  } catch {
    // Graceful degradation — permission resolution falls back to empty.
    return NextResponse.json({ roles: [] });
  }
}
