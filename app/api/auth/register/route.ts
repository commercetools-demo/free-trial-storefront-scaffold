import { NextRequest, NextResponse } from 'next/server';
import { signUp, signIn } from '@/lib/ct/auth';
import { getSession, createSessionToken, setSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
  const { email, password, firstName, lastName } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const session = await getSession();
  try {
    await signUp({ email, password, firstName, lastName });

    // Registration does not log in — sign in immediately (merges anonymous cart).
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
  } catch (e) {
    const msg = String(e);
    if (msg.includes('DuplicateField') || msg.toLowerCase().includes('already')) {
      return NextResponse.json(
        { error: 'An account with that email already exists.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Could not create account.' }, { status: 400 });
  }
}
