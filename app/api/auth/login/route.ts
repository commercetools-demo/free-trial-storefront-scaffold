import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/ct/auth';
import { getSession, createSessionToken, setSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const session = await getSession();
  try {
    const result = await signIn(email, password, session.cartId);
    const customer = result.customer;
    const mergedCartId = result.cart?.id ?? session.cartId;

    const token = await createSessionToken({
      ...session,
      customerId: customer.id,
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      cartId: mergedCartId,
    });
    const res = NextResponse.json({ customer });
    return setSessionCookie(res, token);
  } catch {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
}
