'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_APPROVAL_FLOWS, keyApprovalFlow } from '@/lib/cache-keys';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import type { ApprovalFlow } from '@/lib/types';

export function useApprovalFlows(status?: string) {
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;
  const { data, isLoading } = useSWR<ApprovalFlow[]>(
    buKey ? [KEY_APPROVAL_FLOWS, buKey, status ?? 'all'] : null,
    async () => {
      const res = await fetch(`/api/approval-flows${status ? `?status=${status}` : ''}`);
      return res.ok ? ((await res.json()).approvalFlows ?? []) : [];
    },
    { revalidateOnFocus: false }
  );
  return { approvalFlows: data ?? [], isLoading };
}

export function useApprovalFlow(id: string | null) {
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;
  const { data, isLoading, mutate } = useSWR<ApprovalFlow | null>(
    id && buKey ? [keyApprovalFlow(id), buKey] : null,
    async () => {
      const res = await fetch(`/api/approval-flows/${id}`);
      return res.ok ? (await res.json()).approvalFlow : null;
    },
    { revalidateOnFocus: false }
  );
  return { flow: data ?? null, isLoading, mutate };
}

export function useApprovalFlowActions(id: string) {
  const { mutate } = useSWRConfig();
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;

  async function act(action: 'approve' | 'reject', reason?: string) {
    const res = await fetch(`/api/approval-flows/${id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Action failed');
    const { approvalFlow } = await res.json();
    if (buKey) {
      mutate([keyApprovalFlow(id), buKey], approvalFlow, { revalidate: false });
      // Invalidate the lists so counts refresh.
      mutate((key) => Array.isArray(key) && key[0] === KEY_APPROVAL_FLOWS);
    }
    return approvalFlow as ApprovalFlow;
  }

  return { approve: () => act('approve'), reject: (reason?: string) => act('reject', reason) };
}
