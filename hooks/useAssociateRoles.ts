'use client';
import useSWR from 'swr';
import { KEY_ASSOCIATE_ROLES } from '@/lib/cache-keys';
import type { AssociateRole } from '@/lib/types';

export function useAssociateRoles() {
  const { data, isLoading } = useSWR<AssociateRole[]>(
    KEY_ASSOCIATE_ROLES,
    async () => {
      const res = await fetch('/api/associate-roles');
      return res.ok ? ((await res.json()).roles ?? []) : [];
    },
    { revalidateOnFocus: false }
  );
  return { roles: data ?? [], isLoading };
}
