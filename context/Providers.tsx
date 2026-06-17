'use client';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { BusinessUnitProvider } from '@/context/BusinessUnitContext';
import { KEY_CART, KEY_ACCOUNT } from '@/lib/cache-keys';
import type { Cart } from '@/lib/types';
import type { AccountUser } from '@/hooks/useAccount';

export function Providers({
  children,
  initialCart,
  initialUser,
}: {
  children: ReactNode;
  initialCart: Cart | null;
  initialUser: AccountUser | null;
}) {
  return (
    <SWRConfig value={{ fallback: { [KEY_CART]: initialCart, [KEY_ACCOUNT]: initialUser } }}>
      <BusinessUnitProvider>{children}</BusinessUnitProvider>
    </SWRConfig>
  );
}
