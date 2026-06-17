'use client';
import useSWR from 'swr';
import { KEY_ORDERS } from '@/lib/cache-keys';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import type { OrderSummary } from '@/lib/ct/orders';

export function useOrders() {
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;
  const { data, isLoading } = useSWR<OrderSummary[]>(
    buKey ? [KEY_ORDERS, buKey] : null,
    async () => {
      const res = await fetch('/api/orders');
      return res.ok ? ((await res.json()).orders ?? []) : [];
    },
    { revalidateOnFocus: false }
  );
  return { orders: data ?? [], isLoading };
}
