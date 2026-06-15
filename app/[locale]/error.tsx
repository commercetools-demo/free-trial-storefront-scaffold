'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <p className="text-6xl font-black text-gradient">Oops</p>
      <h1 className="mt-4 text-3xl font-black tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-ink/50">
        We hit a snag loading this page. This is often a commercetools connection or configuration
        issue — check your <code className="rounded bg-mist px-1.5 py-0.5">.env</code> credentials.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button variant="primary" size="lg" onClick={reset}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline" size="lg">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
