import { apiRoot } from './client';
import { mapApprovalFlow } from '@/lib/mappers/approvalFlow';
import type { ApprovalFlow } from '@/lib/types';

function flows(associateId: string, businessUnitKey: string) {
  return apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .approvalFlows();
}

const DETAIL_EXPAND = ['order', 'approvals[*].approver.customer', 'rejection.rejecter.customer'];

export async function getApprovalFlows(
  associateId: string,
  businessUnitKey: string,
  status?: string
): Promise<ApprovalFlow[]> {
  const { body } = await flows(associateId, businessUnitKey)
    .get({
      queryArgs: {
        limit: 100,
        sort: 'createdAt desc',
        expand: ['order'],
        ...(status ? { where: `status = "${status}"` } : {}),
      },
    })
    .execute();
  return body.results.map(mapApprovalFlow);
}

export async function getApprovalFlowById(
  associateId: string,
  businessUnitKey: string,
  id: string
): Promise<ApprovalFlow> {
  const { body } = await flows(associateId, businessUnitKey)
    .withId({ ID: id })
    .get({ queryArgs: { expand: DETAIL_EXPAND } })
    .execute();
  return mapApprovalFlow(body);
}

// Read-then-write: always fetch the current version immediately before posting.
async function currentVersion(associateId: string, businessUnitKey: string, id: string): Promise<number> {
  const { body } = await flows(associateId, businessUnitKey).withId({ ID: id }).get().execute();
  return body.version;
}

export async function approveFlow(
  associateId: string,
  businessUnitKey: string,
  id: string
): Promise<ApprovalFlow> {
  const version = await currentVersion(associateId, businessUnitKey, id);
  const { body } = await flows(associateId, businessUnitKey)
    .withId({ ID: id })
    .post({ body: { version, actions: [{ action: 'approve' }] } })
    .execute();
  return mapApprovalFlow(body);
}

export async function rejectFlow(
  associateId: string,
  businessUnitKey: string,
  id: string,
  reason?: string
): Promise<ApprovalFlow> {
  const version = await currentVersion(associateId, businessUnitKey, id);
  const { body } = await flows(associateId, businessUnitKey)
    .withId({ ID: id })
    .post({ body: { version, actions: [{ action: 'reject', reason }] } })
    .execute();
  return mapApprovalFlow(body);
}
