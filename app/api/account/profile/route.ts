import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCustomerById } from '@/lib/ct/auth';
import { mapCustomer } from '@/lib/mappers/customer';

export async function GET() {
  const session = await getSession();
  if (!session.customerId) return NextResponse.json({ customer: null });
  try {
    const customer = await getCustomerById(session.customerId);
    return NextResponse.json({ customer: mapCustomer(customer) });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
