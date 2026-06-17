'use client';
import { useLocale } from 'next-intl';
import { useOrders } from '@/hooks/useOrders';
import { usePermissions } from '@/hooks/usePermissions';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui';
import { formatMoney } from '@/lib/utils';
import type { OrderSummary } from '@/lib/ct/orders';

const STATE_TONE: Record<string, 'success' | 'warning' | 'neutral' | 'info'> = {
  Confirmed: 'success',
  Complete: 'success',
  Open: 'warning',
  Cancelled: 'neutral',
};

export default function OrdersPage() {
  const locale = useLocale();
  const { orders, isLoading } = useOrders();
  const { hasAnyPermission } = usePermissions();

  if (!hasAnyPermission(['ViewMyOrders', 'ViewOthersOrders'])) return null;

  const columns: Column<OrderSummary & { id?: string }>[] = [
    { key: 'orderNumber', header: 'Order', render: (o) => o.orderNumber ?? o.id.slice(0, 8) },
    {
      key: 'createdAt',
      header: 'Date',
      render: (o) => new Date(o.createdAt).toLocaleDateString(locale),
    },
    { key: 'itemCount', header: 'Items', render: (o) => o.itemCount },
    {
      key: 'orderState',
      header: 'Status',
      render: (o) => <Badge tone={STATE_TONE[o.orderState] ?? 'neutral'}>{o.orderState}</Badge>,
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: (o) => formatMoney(o.total.centAmount, o.total.currencyCode, locale),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-charcoal">Orders</h1>
      <Table columns={columns} data={orders} loading={isLoading} emptyMessage="No orders yet." />
    </div>
  );
}
