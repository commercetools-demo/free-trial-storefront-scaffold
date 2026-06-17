'use client';
import { useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useAuthMutations } from '@/hooks/useAccount';
import { Button, Input, Label, Card, Alert } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { register, login } = useAuthMutations();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      // Sign the new customer in immediately.
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <h1 className="text-xl font-semibold text-charcoal">Create an account</h1>
        <p className="mt-1 text-sm text-charcoal-light">
          A seller must assign you to a business unit before B2B features become available.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={form.firstName} onChange={update('firstName')} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={form.lastName} onChange={update('lastName')} required />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-charcoal-light">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-terra hover:text-terra-dark">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
