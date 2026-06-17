'use client';
import { SWRConfig } from 'swr';
import { CartProvider } from '@/context/CartProvider';
import { KEY_CART, KEY_ACCOUNT } from '@/lib/cache-keys';
import type { Cart, Customer } from '@/lib/types';

export function Providers({
  initialCart,
  initialUser,
  children,
}: {
  initialCart: Cart | null;
  initialUser: Customer | null;
  children: React.ReactNode;
}) {
  return (
    <SWRConfig value={{ fallback: { [KEY_CART]: initialCart, [KEY_ACCOUNT]: initialUser } }}>
      <CartProvider initialCart={initialCart}>{children}</CartProvider>
    </SWRConfig>
  );
}
