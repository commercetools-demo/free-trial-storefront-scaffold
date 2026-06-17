'use client';
import useSWR from 'swr';
import type { ShippingMethodOption } from '@/lib/ct/shippingMethods';

export function useShippingMethods(enabled: boolean) {
  const { data, isLoading } = useSWR<ShippingMethodOption[]>(
    enabled ? 'shipping-methods' : null,
    async () => {
      const res = await fetch('/api/shipping-methods');
      return res.ok ? ((await res.json()).shippingMethods ?? []) : [];
    },
    { revalidateOnFocus: false }
  );
  return { shippingMethods: data ?? [], isLoading };
}
