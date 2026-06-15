'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';
import Spinner from '@/components/ui/Spinner';

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [user, router, pathname]);

  if (!user) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner size={32} />
      </div>
    );
  }

  return <>{children}</>;
}
