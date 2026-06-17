import { NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getCustomerOrders } from '@/lib/ct/orders';
import { mapOrder } from '@/lib/mappers/cart';

// GET /api/account/orders — the current customer's order history
export async function GET() {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const orders = await getCustomerOrders(session.customerId);
    return NextResponse.json({ orders: orders.map((o) => mapOrder(o, locale)) });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
