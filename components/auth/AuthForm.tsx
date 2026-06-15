'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { KEY_ACCOUNT, KEY_CART } from '@/lib/cache-keys';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate } = useSWRConfig();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isLogin = mode === 'login';
  const redirect = searchParams.get('redirect') || '/account';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch(`/api/auth/${isLogin ? 'login' : 'register'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.');
      return;
    }

    // Refresh account + cart caches (anonymous cart was merged on the server).
    await Promise.all([mutate(KEY_ACCOUNT), mutate(KEY_CART)]);
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight">
          {isLogin ? 'Welcome back' : 'Join LUMINA'}
        </h1>
        <p className="mt-1 text-ink/50">
          {isLogin ? 'Sign in to your account' : 'Create an account to start shopping'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3">
            <Input name="firstName" label="First name" autoComplete="given-name" required />
            <Input name="lastName" label="Last name" autoComplete="family-name" required />
          </div>
        )}
        <Input name="email" type="email" label="Email" autoComplete="email" required />
        <Input
          name="password"
          type="password"
          label="Password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          minLength={6}
          required
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={busy}>
          {isLogin ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        {isLogin ? (
          <>
            New here?{' '}
            <Link href="/register" className="font-semibold text-violet hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-violet hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
