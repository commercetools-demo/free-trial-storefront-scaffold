import { NextRequest } from 'next/server';
import { getSession, withSession } from '@/lib/session';
import { signUp, signIn } from '@/lib/ct/auth';

// POST /api/auth/register — { email, password, firstName, lastName }
export async function POST(req: NextRequest) {
  const session = await getSession();
  const { email, password, firstName, lastName } = await req.json();
  if (!email || !password) {
    return withSession(session, { error: 'Email and password required' }, 400);
  }
  try {
    await signUp({ email, password, firstName, lastName });
    // Registration does not log the customer in — sign in immediately (merges anon cart).
    const result = await signIn(email, password, session.cartId);
    const customer = result.customer;
    const newSession = {
      ...session,
      customerId: customer.id,
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      cartId: result.cart?.id ?? session.cartId,
    };
    return withSession(newSession, {
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error && e.message.includes('There is already')
      ? 'An account with this email already exists'
      : 'Registration failed';
    return withSession(session, { error: msg }, 400);
  }
}
