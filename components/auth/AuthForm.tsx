'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthActions } from '@/hooks/useAccount';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

function Input({
  label, type = 'text', value, onChange, required, autoComplete,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-charcoal-light">{label}{required && ' *'}</span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border bg-cream px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-charcoal"
      />
    </label>
  );
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { login, register } = useAuthActions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await login(email, password);
      else await register({ email, password, firstName, lastName });
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
      setBusy(false);
    }
  }

  const otherHref = mode === 'login'
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : `/login?redirect=${encodeURIComponent(redirect)}`;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-charcoal">
        {mode === 'login' ? t('signInTitle') : t('registerTitle')}
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('firstName')} value={firstName} onChange={setFirstName} autoComplete="given-name" />
            <Input label={t('lastName')} value={lastName} onChange={setLastName} autoComplete="family-name" />
          </div>
        )}
        <Input label={t('email')} type="email" value={email} onChange={setEmail} required autoComplete="email" />
        <Input
          label={t('password')}
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {error && <p className="text-sm text-terra">{error}</p>}
        <Button type="submit" disabled={busy} className="mt-2">
          {busy && <Spinner />} {mode === 'login' ? t('signIn') : t('createAccount')}
        </Button>
      </form>
      <p className="mt-6 text-sm text-charcoal-light">
        {mode === 'login' ? t('noAccount') : t('haveAccount')}
        <Link href={otherHref} className="text-terra hover:underline">
          {mode === 'login' ? t('createOne') : t('signIn')}
        </Link>
      </p>
    </div>
  );
}
