import { NextResponse } from 'next/server';
import { getLocale } from '@/lib/session';
import { getShippingMethodsForCurrency } from '@/lib/ct/shipping';

export async function GET() {
  const { currency, locale } = await getLocale();
  try {
    const shippingMethods = await getShippingMethodsForCurrency(currency, locale);
    return NextResponse.json({ shippingMethods });
  } catch {
    return NextResponse.json({ shippingMethods: [] });
  }
}
