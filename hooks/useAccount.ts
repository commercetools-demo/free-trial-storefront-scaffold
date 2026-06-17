'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_ACCOUNT } from '@/lib/cache-keys';

export interface AccountUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export function useAccount() {
  const { data, isLoading } = useSWR<AccountUser | null>(
    KEY_ACCOUNT,
    async () => {
      const res = await fetch('/api/auth/me');
      return res.ok ? ((await res.json()).user ?? null) : null;
    },
    { revalidateOnFocus: false }
  );
  return { user: data ?? null, isLoading };
}

export function useAuthMutations() {
  const { mutate } = useSWRConfig();

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Login failed');
    const { user } = await res.json();
    await mutate(KEY_ACCOUNT, user, { revalidate: false });
    return user as AccountUser;
  }

  async function register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Registration failed');
    return res.json();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    await mutate(KEY_ACCOUNT, null, { revalidate: false });
  }

  return { login, register, logout };
}
