'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, router, pathname]);

  if (user === undefined) return null; // loading
  if (user === null) return null; // redirecting
  return <>{children}</>;
}
