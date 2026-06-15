'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { useSWRConfig } from 'swr';
import { useAccount } from '@/hooks/useAccount';
import { KEY_ACCOUNT, KEY_CART } from '@/lib/cache-keys';
import Spinner from '@/components/ui/Spinner';

const NAV = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/wishlists', label: 'Wishlist' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

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

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    mutate(KEY_ACCOUNT, null, { revalidate: false });
    mutate(KEY_CART, null, { revalidate: false });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <h1 className="mb-8 text-4xl font-black tracking-tight">
        Hi, {user.firstName || 'there'} <span className="text-gradient">✦</span>
      </h1>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    active ? 'bg-aurora text-white' : 'text-ink-soft hover:bg-mist'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-ink-soft hover:bg-mist"
            >
              Sign out
            </button>
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
