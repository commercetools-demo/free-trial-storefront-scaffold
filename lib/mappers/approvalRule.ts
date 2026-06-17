import type { ApprovalRule as CtApprovalRule } from '@commercetools/platform-sdk';
import type { ApprovalRule } from '@/lib/types';

export function mapApprovalRule(rule: CtApprovalRule): ApprovalRule {
  const approverTiers = (rule.approvers?.tiers ?? []).map((tier) =>
    // each tier: { and: [{ or: [RuleApprover] }] } — flatten OR roles within the tier
    (tier.and ?? []).flatMap((disj) => (disj.or ?? []).map((a) => a.associateRole.key))
  );

  return {
    id: rule.id,
    version: rule.version,
    key: rule.key,
    name: rule.name,
    description: rule.description,
    status: rule.status as 'Active' | 'Inactive',
    predicate: rule.predicate,
    approverTiers,
    requesterRoleKeys: (rule.requesters ?? []).map((r) => r.associateRole.key),
  };
}
