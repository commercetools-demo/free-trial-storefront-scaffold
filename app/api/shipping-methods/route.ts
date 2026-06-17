import { NextResponse } from 'next/server';
import { getLocale } from '@/lib/session';
import { getShippingMethodsForCurrency } from '@/lib/ct/shipping';

// GET /api/shipping-methods — methods available for the session currency
export async function GET() {
  const { currency, locale } = await getLocale();
  try {
    const shippingMethods = await getShippingMethodsForCurrency(currency, locale);
    return NextResponse.json({ shippingMethods });
  } catch {
    return NextResponse.json({ shippingMethods: [] });
  }
}
