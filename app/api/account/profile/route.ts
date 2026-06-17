import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCustomerById } from '@/lib/ct/auth';

// GET /api/account/profile — the current customer, or null
export async function GET() {
  const session = await getSession();
  if (!session.customerId) return NextResponse.json({ customer: null });
  try {
    const c = await getCustomerById(session.customerId);
    return NextResponse.json({
      customer: {
        id: c.id,
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        addresses: c.addresses,
        defaultShippingAddressId: c.defaultShippingAddressId,
        defaultBillingAddressId: c.defaultBillingAddressId,
      },
    });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
