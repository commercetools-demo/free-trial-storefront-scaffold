import { redirect } from '@/i18n/routing';
import { getSession, type Session } from '@/lib/session';

/**
 * Server-side guard for protected pages. Redirects unauthenticated visitors to
 * /login (preserving the intended destination). Call OUTSIDE any try/catch —
 * redirect() throws an internal control-flow signal.
 */
export async function requireSession(locale: string, redirectTo?: string): Promise<Session> {
  const session = await getSession();
  if (!session.customerId) {
    const target = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
    redirect({ href: target, locale });
  }
  return session;
}
