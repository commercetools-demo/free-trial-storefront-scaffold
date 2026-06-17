import { NextRequest, NextResponse } from 'next/server';
import { signUpCustomer } from '@/lib/ct/auth';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; firstName?: string; lastName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { email, password, firstName, lastName } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const customer = await signUpCustomer({ email, password, firstName, lastName });
    return NextResponse.json({
      user: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Registration failed';
    // Most commonly: a customer with this email already exists.
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
