import { apiRoot } from './client';
import type { AssociateRole } from '@/lib/types';

export async function getAssociateRoles(): Promise<AssociateRole[]> {
  const { body } = await apiRoot.associateRoles().get({ queryArgs: { limit: 200 } }).execute();
  return body.results.map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    permissions: r.permissions ?? [],
  }));
}
