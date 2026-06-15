'use client';

import { type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { LocaleProvider, type LocaleValue } from './LocaleContext';
import { CartProvider } from './CartContext';
import type { Cart } from '@/lib/types';

export default function Providers({
  children,
  localeValue,
  messages,
  initialCart,
}: {
  children: ReactNode;
  localeValue: LocaleValue;
  messages: Record<string, unknown>;
  initialCart: Cart | null;
}) {
  return (
    <NextIntlClientProvider locale={localeValue.locale} messages={messages}>
      <LocaleProvider value={localeValue}>
        <CartProvider initialCart={initialCart}>{children}</CartProvider>
      </LocaleProvider>
    </NextIntlClientProvider>
  );
}
