'use client';
import useSWR from 'swr';
import { KEY_ORDERS } from '@/lib/cache-keys';
import type { OrderSummary } from '@/lib/types';

async function fetchOrders(): Promise<OrderSummary[]> {
  const res = await fetch('/api/account/orders');
  if (!res.ok) return [];
  return (await res.json()).orders ?? [];
}

export function useOrders() {
  const { data, isLoading } = useSWR<OrderSummary[]>(KEY_ORDERS, fetchOrders, {
    revalidateOnFocus: false,
  });
  return { orders: data ?? [], isLoading };
}
