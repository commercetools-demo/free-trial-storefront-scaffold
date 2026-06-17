'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useApprovalFlows } from '@/hooks/useApprovalFlows';
import { usePermissions } from '@/hooks/usePermissions';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui';
import { formatMoney } from '@/lib/utils';
import type { ApprovalFlow } from '@/lib/types';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
};

const FILTERS = ['all', 'Pending', 'Approved', 'Rejected'] as const;

export default function ApprovalFlowsPage() {
  const locale = useLocale();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const { approvalFlows, isLoading } = useApprovalFlows(filter === 'all' ? undefined : filter);
  const { hasAnyPermission } = usePermissions();

  if (!hasAnyPermission(['UpdateApprovalFlows'])) return null;

  const columns: Column<ApprovalFlow & { id?: string }>[] = [
    { key: 'orderNumber', header: 'Order', render: (f) => f.orderNumber ?? f.orderId.slice(0, 8) },
    {
      key: 'createdAt',
      header: 'Created',
      render: (f) => new Date(f.createdAt).toLocaleDateString(locale),
    },
    {
      key: 'total',
      header: 'Total',
      render: (f) => (f.total ? formatMoney(f.total.centAmount, f.total.currencyCode, locale) : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (f) => <Badge tone={STATUS_TONE[f.status] ?? 'neutral'}>{f.status}</Badge>,
    },
    {
      key: 'view',
      header: '',
      render: (f) => (
        <Link href={`/dashboard/approval-flows/${f.id}` as `/${string}`} className="text-sm text-terra hover:text-terra-dark">
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-charcoal">Approval flows</h1>
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === f ? 'border-charcoal bg-charcoal text-white' : 'border-border text-charcoal-light'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>
      <Table columns={columns} data={approvalFlows} loading={isLoading} emptyMessage="No approval flows." />
    </div>
  );
}
