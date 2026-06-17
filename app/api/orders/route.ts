import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getOrdersForBusinessUnit } from '@/lib/ct/orders';

export async function GET() {
  const session = await getSession();
  if (!session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const orders = await getOrdersForBusinessUnit(session.customerId, session.businessUnitKey);
    return NextResponse.json({ orders });
  } catch {
    // 403 when the associate lacks ViewMy/OthersOrders — degrade gracefully.
    return NextResponse.json({ orders: [] });
  }
}
