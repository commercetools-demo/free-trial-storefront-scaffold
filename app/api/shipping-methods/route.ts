import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getShippingMethodsForCart } from '@/lib/ct/shippingMethods';

export async function GET() {
  const session = await getSession();
  if (!session.cartId) return NextResponse.json({ shippingMethods: [] });
  try {
    const shippingMethods = await getShippingMethodsForCart(session.cartId);
    return NextResponse.json({ shippingMethods });
  } catch {
    return NextResponse.json({ shippingMethods: [] });
  }
}
