'use client';
import useSWR from 'swr';
import { useMemo } from 'react';
import { KEY_ASSOCIATE_ROLES } from '@/lib/cache-keys';
import { useAccount } from '@/hooks/useAccount';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import type { AssociateRole, Permission } from '@/lib/types';

export function usePermissions() {
  const { user } = useAccount();
  const { currentBusinessUnit } = useBusinessUnit();

  const { data: allRoles } = useSWR<AssociateRole[]>(
    KEY_ASSOCIATE_ROLES,
    async () => {
      const res = await fetch('/api/associate-roles');
      return res.ok ? ((await res.json()).roles ?? []) : [];
    },
    { revalidateOnFocus: false }
  );

  const { permissions, roleKeys } = useMemo(() => {
    const roleKeySet = new Set<string>();
    const permissionSet = new Set<string>();
    if (user && currentBusinessUnit) {
      const associate = currentBusinessUnit.associates.find((a) => a.customerId === user.id);
      associate?.roleKeys.forEach((k) => roleKeySet.add(k));
      for (const role of allRoles ?? []) {
        if (roleKeySet.has(role.key)) role.permissions.forEach((p) => permissionSet.add(p));
      }
    }
    return { permissions: permissionSet, roleKeys: roleKeySet };
  }, [user, currentBusinessUnit, allRoles]);

  const can = (permission: Permission) => permissions.has(permission);
  const hasAnyPermission = (ps: Permission[]) => ps.some((p) => permissions.has(p));
  const hasAllPermissions = (ps: Permission[]) => ps.every((p) => permissions.has(p));

  return { can, hasAnyPermission, hasAllPermissions, roleKeys, permissions };
}
