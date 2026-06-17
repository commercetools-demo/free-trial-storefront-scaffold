import { apiRoot } from './client';
import { mapApprovalRule } from '@/lib/mappers/approvalRule';
import type { ApprovalRule } from '@/lib/types';
import type {
  ApprovalRuleDraft,
  ApproverHierarchyDraft,
  ApprovalRuleUpdateAction,
} from '@commercetools/platform-sdk';

function rules(associateId: string, businessUnitKey: string) {
  return apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalRules();
}

export interface ApprovalRuleInput {
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  predicate: string;
  /** sequential tiers; each tier is a list of role keys (OR within tier) */
  approverTiers: string[][];
  requesterRoleKeys: string[];
}

function toHierarchy(approverTiers: string[][]): ApproverHierarchyDraft {
  return {
    tiers: approverTiers.map((roleKeys) => ({
      and: [
        {
          or: roleKeys.map((key) => ({ associateRole: { typeId: 'associate-role', key } })),
        },
      ],
    })),
  };
}

export async function getApprovalRules(
  associateId: string,
  businessUnitKey: string
): Promise<ApprovalRule[]> {
  const { body } = await rules(associateId, businessUnitKey)
    .get({ queryArgs: { limit: 100, sort: 'createdAt desc' } })
    .execute();
  return body.results.map(mapApprovalRule);
}

export async function getApprovalRuleById(
  associateId: string,
  businessUnitKey: string,
  id: string
): Promise<ApprovalRule> {
  const { body } = await rules(associateId, businessUnitKey).withId({ ID: id }).get().execute();
  return mapApprovalRule(body);
}

export async function createApprovalRule(
  associateId: string,
  businessUnitKey: string,
  input: ApprovalRuleInput
): Promise<ApprovalRule> {
  const draft: ApprovalRuleDraft = {
    name: input.name,
    description: input.description,
    status: input.status,
    predicate: input.predicate,
    approvers: toHierarchy(input.approverTiers),
    requesters: input.requesterRoleKeys.map((key) => ({
      associateRole: { typeId: 'associate-role', key },
    })),
  };
  const { body } = await rules(associateId, businessUnitKey).post({ body: draft }).execute();
  return mapApprovalRule(body);
}

export async function updateApprovalRule(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number,
  input: ApprovalRuleInput
): Promise<ApprovalRule> {
  const actions: ApprovalRuleUpdateAction[] = [
    { action: 'setName', name: input.name },
    { action: 'setDescription', description: input.description },
    { action: 'setStatus', status: input.status },
    { action: 'setPredicate', predicate: input.predicate },
    { action: 'setApprovers', approvers: toHierarchy(input.approverTiers) },
    {
      action: 'setRequesters',
      requesters: input.requesterRoleKeys.map((key) => ({
        associateRole: { typeId: 'associate-role', key },
      })),
    },
  ];
  const { body } = await rules(associateId, businessUnitKey)
    .withId({ ID: id })
    .post({ body: { version, actions } })
    .execute();
  return mapApprovalRule(body);
}

/** commercetools has no delete for approval rules — deactivate by setting status Inactive. */
export async function deactivateApprovalRule(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number
): Promise<ApprovalRule> {
  const { body } = await rules(associateId, businessUnitKey)
    .withId({ ID: id })
    .post({ body: { version, actions: [{ action: 'setStatus', status: 'Inactive' }] } })
    .execute();
  return mapApprovalRule(body);
}
