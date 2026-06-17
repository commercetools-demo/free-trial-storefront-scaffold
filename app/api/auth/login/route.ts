import { NextRequest } from 'next/server';
import { getSession, withSession } from '@/lib/session';
import { signIn } from '@/lib/ct/auth';

// POST /api/auth/login — { email, password }
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return withSession(await getSession(), { error: 'Email and password required' }, 400);
  }
  const session = await getSession();
  try {
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
  } catch {
    return withSession(session, { error: 'Invalid email or password' }, 401);
  }
}
