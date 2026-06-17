'use client';
import { useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useAuthMutations } from '@/hooks/useAccount';
import { Button, Input, Label, Card, Alert } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthMutations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const redirectTo =
        new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
      router.push(redirectTo as `/${string}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <h1 className="text-xl font-semibold text-charcoal">Sign in</h1>
        <p className="mt-1 text-sm text-charcoal-light">
          Access your business unit catalog, carts, and orders.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert tone="danger">{error}</Alert>}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-charcoal-light">
          No account?{' '}
          <Link href="/register" className="font-medium text-terra hover:text-terra-dark">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
