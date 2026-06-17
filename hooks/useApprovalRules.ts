'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_APPROVAL_RULES } from '@/lib/cache-keys';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import type { ApprovalRule } from '@/lib/types';
import type { ApprovalRuleInput } from '@/lib/ct/approvalRules';

export function useApprovalRules() {
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;
  const { data, isLoading } = useSWR<ApprovalRule[]>(
    buKey ? [KEY_APPROVAL_RULES, buKey] : null,
    async () => {
      const res = await fetch('/api/approval-rules');
      return res.ok ? ((await res.json()).approvalRules ?? []) : [];
    },
    { revalidateOnFocus: false }
  );
  return { approvalRules: data ?? [], isLoading };
}

export function useApprovalRuleMutations() {
  const { mutate } = useSWRConfig();
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;

  function refresh() {
    if (buKey) mutate([KEY_APPROVAL_RULES, buKey]);
  }

  async function createRule(input: ApprovalRuleInput) {
    const res = await fetch('/api/approval-rules', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to create rule');
    refresh();
  }

  async function updateRule(id: string, input: ApprovalRuleInput) {
    const res = await fetch(`/api/approval-rules/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to update rule');
    refresh();
  }

  async function deactivateRule(id: string) {
    const res = await fetch(`/api/approval-rules/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to deactivate rule');
    refresh();
  }

  return { createRule, updateRule, deactivateRule };
}
