'use client';
import useSWR from 'swr';
import { KEY_SHIPPING_METHODS } from '@/lib/cache-keys';
import type { ShippingMethod } from '@/lib/types';

async function fetchMethods(): Promise<ShippingMethod[]> {
  const res = await fetch('/api/shipping-methods');
  if (!res.ok) return [];
  return (await res.json()).shippingMethods ?? [];
}

export function useShippingMethods(country?: string, currency?: string) {
  const key = country && currency ? [KEY_SHIPPING_METHODS, country, currency] : null;
  const { data, isLoading } = useSWR<ShippingMethod[]>(key, fetchMethods, {
    revalidateOnFocus: false,
  });
  return { methods: data ?? [], isLoading };
}
