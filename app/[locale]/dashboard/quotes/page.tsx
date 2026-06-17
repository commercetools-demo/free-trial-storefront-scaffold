'use client';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useQuotes } from '@/hooks/useQuotes';
import { usePermissions } from '@/hooks/usePermissions';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui';
import { formatMoney } from '@/lib/utils';
import { QUOTE_STATE_LABELS } from '@/lib/mappers/quote';
import type { QuoteThread } from '@/lib/types';

const STATE_TONE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  Accepted: 'success',
  Declined: 'danger',
  Rejected: 'danger',
  Pending: 'info',
  RenegotiationAddressed: 'info',
  DeclinedForRenegotiation: 'warning',
  Submitted: 'warning',
  Withdrawn: 'neutral',
  Cancelled: 'neutral',
  Closed: 'neutral',
};

export default function QuotesPage() {
  const locale = useLocale();
  const { quotes, isLoading } = useQuotes();
  const { hasAnyPermission } = usePermissions();

  if (!hasAnyPermission(['ViewMyQuotes', 'ViewOthersQuotes'])) return null;

  const columns: Column<QuoteThread & { id?: string }>[] = [
    {
      key: 'id',
      header: 'Request',
      render: (q) => <span className="font-mono text-xs">{q.quoteRequestId.slice(0, 8)}</span>,
    },
    { key: 'createdAt', header: 'Created', render: (q) => new Date(q.createdAt).toLocaleDateString(locale) },
    { key: 'itemCount', header: 'Items', render: (q) => q.itemCount },
    {
      key: 'total',
      header: 'Total',
      render: (q) => (q.totalPrice ? formatMoney(q.totalPrice.centAmount, q.totalPrice.currencyCode, locale) : '—'),
    },
    {
      key: 'state',
      header: 'Status',
      render: (q) => (
        <span className="flex items-center gap-2">
          <Badge tone={STATE_TONE[q.effectiveState] ?? 'neutral'}>
            {QUOTE_STATE_LABELS[q.effectiveState] ?? q.effectiveState}
          </Badge>
          {q.rounds.length > 1 && <span className="text-xs text-charcoal-light">· {q.rounds.length} rounds</span>}
        </span>
      ),
    },
    {
      key: 'view',
      header: '',
      render: (q) => (
        <Link href={`/dashboard/quotes/${q.id}` as `/${string}`} className="text-sm text-terra hover:text-terra-dark">
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-charcoal">Quotes</h1>
      <p className="text-sm text-charcoal-light">
        Quote requests you submit from the cart appear here. Track seller responses and accept, decline, or renegotiate.
      </p>
      <Table columns={columns} data={quotes} loading={isLoading} emptyMessage="No quote requests yet." />
    </div>
  );
}
