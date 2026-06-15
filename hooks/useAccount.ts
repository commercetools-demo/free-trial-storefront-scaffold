'use client';

import useSWR from 'swr';
import { KEY_ACCOUNT } from '@/lib/cache-keys';
import type { Customer } from '@/lib/types';

async function accountFetcher(): Promise<Customer | null> {
  const res = await fetch('/api/account/profile');
  if (!res.ok) return null;
  const data = await res.json();
  return data.customer ?? null;
}

export function useAccount() {
  const { data, mutate, isLoading } = useSWR<Customer | null>(KEY_ACCOUNT, accountFetcher, {
    revalidateOnFocus: false,
  });
  return { user: data, mutate, isLoading };
}
