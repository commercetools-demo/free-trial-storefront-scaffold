import type { ApprovalFlow as CtApprovalFlow, Order } from '@commercetools/platform-sdk';
import type { ApprovalFlow } from '@/lib/types';

export function mapApprovalFlow(flow: CtApprovalFlow): ApprovalFlow {
  const order = (flow.order as { obj?: Order })?.obj;
  return {
    id: flow.id,
    version: flow.version,
    status: flow.status as ApprovalFlow['status'],
    orderId: flow.order.id,
    orderNumber: order?.orderNumber,
    businessUnitKey: flow.businessUnit.key ?? '',
    total: order
      ? { centAmount: order.totalPrice.centAmount, currencyCode: order.totalPrice.currencyCode }
      : undefined,
    rules: (flow.rules ?? []).map((r) => ({ id: r.id, name: r.name })),
    currentTierPendingApproverRoleKeys: (flow.currentTierPendingApprovers ?? []).map(
      (a) => a.associateRole.key
    ),
    eligibleApproverRoleKeys: (flow.eligibleApprovers ?? []).map((a) => a.associateRole.key),
    pendingApproverRoleKeys: (flow.pendingApprovers ?? []).map((a) => a.associateRole.key),
    approvals: (flow.approvals ?? []).map((ap) => ({
      approverCustomerId: ap.approver?.customer?.id ?? '',
      approvedAt: ap.approvedAt,
    })),
    rejection: flow.rejection
      ? {
          reason: flow.rejection.reason,
          rejecterCustomerId: flow.rejection.rejecter?.customer?.id ?? '',
          rejectedAt: flow.rejection.rejectedAt,
        }
      : undefined,
    createdAt: flow.createdAt,
  };
}
