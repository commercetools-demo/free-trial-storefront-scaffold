import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: session.customerId,
      email: session.customerEmail,
      firstName: session.customerFirstName,
      lastName: session.customerLastName,
    },
  });
}
