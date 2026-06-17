'use client';
import { Link } from '@/i18n/routing';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, Badge } from '@/components/ui';
import type { Permission } from '@/lib/types';

export default function DashboardOverview() {
  const { currentBusinessUnit, currentStore } = useBusinessUnit();
  const { hasAnyPermission } = usePermissions();
  const { stats } = useDashboardStats();

  if (!currentBusinessUnit) return null;
  const bu = currentBusinessUnit;

  const cards: Array<{
    label: string;
    value: number | undefined;
    href: string;
    permissions?: Permission[];
  }> = [
    { label: 'Orders', value: stats?.orders, href: '/dashboard/orders', permissions: ['ViewMyOrders', 'ViewOthersOrders'] },
    { label: 'Quotes', value: stats?.quotes, href: '/dashboard/quotes', permissions: ['ViewMyQuotes', 'ViewOthersQuotes'] },
    {
      label: 'Purchase lists',
      value: stats?.purchaseLists,
      href: '/dashboard/purchase-lists',
      permissions: ['ViewMyShoppingLists', 'ViewOthersShoppingLists'],
    },
    {
      label: 'Pending approvals',
      value: stats?.pendingApprovals,
      href: '/dashboard/approval-flows',
      permissions: ['UpdateApprovalFlows'],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-charcoal">{bu.name}</h1>
          <Badge>{bu.unitType}</Badge>
          {bu.status && <Badge tone={bu.status === 'Active' ? 'success' : 'neutral'}>{bu.status}</Badge>}
        </div>
        <p className="mt-1 text-sm text-charcoal-light">
          {bu.associateCount} associate{bu.associateCount === 1 ? '' : 's'}
          {currentStore && ` · Store: ${currentStore.name ?? currentStore.key}`}
          {bu.contactEmail && ` · ${bu.contactEmail}`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const enabled = !card.permissions || hasAnyPermission(card.permissions);
          const content = (
            <Card className={`p-5 ${enabled ? 'hover:shadow-sm' : 'opacity-50'}`}>
              <p className="text-sm text-charcoal-light">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal">
                {enabled ? card.value ?? '—' : '🔒'}
              </p>
            </Card>
          );
          return enabled ? (
            <Link key={card.label} href={card.href as `/${string}`}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-charcoal">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/products" className="rounded-md border border-border px-3 py-1.5 hover:bg-cream-dark">
            Browse products
          </Link>
          <Link href="/dashboard/company" className="rounded-md border border-border px-3 py-1.5 hover:bg-cream-dark">
            Company & associates
          </Link>
          <Link href="/cart" className="rounded-md border border-border px-3 py-1.5 hover:bg-cream-dark">
            View cart
          </Link>
        </div>
      </Card>
    </div>
  );
}
