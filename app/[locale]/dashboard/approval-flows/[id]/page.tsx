'use client';
import { use, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useApprovalFlow, useApprovalFlowActions } from '@/hooks/useApprovalFlows';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, Button, Badge, Alert, Spinner, Textarea, Label } from '@/components/ui';
import { formatMoney } from '@/lib/utils';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
};

export default function ApprovalFlowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const locale = useLocale();
  const { flow, isLoading } = useApprovalFlow(id);
  const { roleKeys } = usePermissions();
  const { approve, reject } = useApprovalFlowActions(id);

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-terra" />
      </div>
    );
  }
  if (!flow) {
    return <Alert tone="danger">Approval flow not found.</Alert>;
  }

  const isEligible = flow.eligibleApproverRoleKeys.some((k) => roleKeys.has(k));
  const canActOnCurrentTier = flow.currentTierPendingApproverRoleKeys.some((k) => roleKeys.has(k));
  const canAct = flow.status === 'Pending' && isEligible && canActOnCurrentTier;

  async function handleApprove() {
    setBusy(true);
    setError(null);
    try {
      await approve();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to approve');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    setError(null);
    try {
      await reject(reason || undefined);
      setRejecting(false);
      setReason('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reject');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/approval-flows" className="text-sm text-charcoal-light hover:text-charcoal">
          ← Approval flows
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-charcoal">
            Order {flow.orderNumber ?? flow.orderId.slice(0, 8)}
          </h1>
          <Badge tone={STATUS_TONE[flow.status] ?? 'neutral'}>{flow.status}</Badge>
        </div>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="p-5">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-charcoal-light">Created</dt>
            <dd className="text-charcoal">{new Date(flow.createdAt).toLocaleString(locale)}</dd>
          </div>
          {flow.total && (
            <div className="flex justify-between">
              <dt className="text-charcoal-light">Order total</dt>
              <dd className="text-charcoal">{formatMoney(flow.total.centAmount, flow.total.currencyCode, locale)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-charcoal-light">Triggered rules</dt>
            <dd className="text-charcoal">{flow.rules.map((r) => r.name).join(', ') || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-charcoal-light">Current tier approvers</dt>
            <dd className="text-charcoal">{flow.currentTierPendingApproverRoleKeys.join(', ') || '—'}</dd>
          </div>
        </dl>
      </Card>

      {/* Approval progress */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-charcoal">Progress</h2>
        {flow.approvals.length === 0 && !flow.rejection ? (
          <p className="mt-2 text-sm text-charcoal-light">No approvals yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {flow.approvals.map((a, i) => (
              <li key={i} className="flex items-center gap-2">
                <Badge tone="success">Approved</Badge>
                <span className="text-charcoal-light">
                  by {a.approverCustomerId.slice(0, 8)} · {new Date(a.approvedAt).toLocaleString(locale)}
                </span>
              </li>
            ))}
            {flow.rejection && (
              <li className="flex items-center gap-2">
                <Badge tone="danger">Rejected</Badge>
                <span className="text-charcoal-light">
                  {flow.rejection.reason ? `“${flow.rejection.reason}” · ` : ''}
                  {new Date(flow.rejection.rejectedAt).toLocaleString(locale)}
                </span>
              </li>
            )}
          </ul>
        )}
      </Card>

      {/* Actions */}
      {canAct && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-charcoal">Your decision</h2>
          {!rejecting ? (
            <div className="mt-3 flex gap-2">
              <Button onClick={handleApprove} disabled={busy}>
                {busy ? 'Working…' : 'Approve'}
              </Button>
              <Button variant="danger" onClick={() => setRejecting(true)} disabled={busy}>
                Reject
              </Button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div>
                <Label htmlFor="reason">Rejection reason (optional)</Label>
                <Textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="danger" onClick={handleReject} disabled={busy}>
                  {busy ? 'Working…' : 'Confirm rejection'}
                </Button>
                <Button variant="ghost" onClick={() => setRejecting(false)} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {flow.status === 'Pending' && !canAct && (
        <p className="text-sm text-charcoal-light">
          {isEligible
            ? 'This flow is awaiting approval from an earlier tier.'
            : 'You are not an eligible approver for this flow.'}
        </p>
      )}
    </div>
  );
}
