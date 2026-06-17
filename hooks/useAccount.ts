'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_ACCOUNT, KEY_CART } from '@/lib/cache-keys';
import type { Customer } from '@/lib/types';

async function fetchAccount(): Promise<Customer | null> {
  const res = await fetch('/api/account/profile');
  if (!res.ok) return null;
  return (await res.json()).customer ?? null;
}

export function useAccount(initialUser?: Customer | null) {
  const { data, isLoading } = useSWR<Customer | null>(KEY_ACCOUNT, fetchAccount, {
    revalidateOnFocus: false,
    fallbackData: initialUser ?? undefined,
  });
  return { user: data, isLoading };
}

export function useAuthActions() {
  const { mutate } = useSWRConfig();

  return {
    async login(email: string, password: string) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Login failed');
      await mutate(KEY_ACCOUNT, json.customer, { revalidate: false });
      await mutate(KEY_CART);
      return json.customer;
    },
    async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Registration failed');
      await mutate(KEY_ACCOUNT, json.customer, { revalidate: false });
      await mutate(KEY_CART);
      return json.customer;
    },
    async logout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      await mutate(KEY_ACCOUNT, null, { revalidate: false });
      await mutate(KEY_CART, null, { revalidate: false });
    },
  };
}
