'use client';

import useSWR from 'swr';
import { keyShippingMethods } from '@/lib/cache-keys';
import { useLocale } from '@/context/LocaleContext';
import type { ShippingMethod } from '@/lib/types';

async function fetcher(): Promise<ShippingMethod[]> {
  const res = await fetch('/api/shipping-methods');
  if (!res.ok) return [];
  const data = await res.json();
  return data.shippingMethods ?? [];
}

export function useShippingMethods() {
  const { country, currency } = useLocale();
  const key = country && currency ? [keyShippingMethods(country, currency), country, currency] : null;
  return useSWR<ShippingMethod[]>(key, fetcher, { revalidateOnFocus: false });
}
