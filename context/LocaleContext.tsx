'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface LocaleValue {
  country: string;
  currency: string;
  locale: string;
}

const LocaleContext = createContext<LocaleValue>({
  country: 'US',
  currency: 'USD',
  locale: 'en-US',
});

export function LocaleProvider({ value, children }: { value: LocaleValue; children: ReactNode }) {
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  return useContext(LocaleContext);
}
