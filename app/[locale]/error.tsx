'use client';
import { Button } from '@/components/ui';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-charcoal">Something went wrong</h1>
      <p className="mt-2 text-charcoal-light">An unexpected error occurred. Please try again.</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
