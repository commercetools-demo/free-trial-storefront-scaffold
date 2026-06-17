'use client';
import { Link, usePathname } from '@/i18n/routing';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/lib/types';
import { cn } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
  requiredPermissions?: Permission[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Company', href: '/dashboard/company' },
  { label: 'Orders', href: '/dashboard/orders', requiredPermissions: ['ViewMyOrders', 'ViewOthersOrders'] },
  { label: 'Quotes', href: '/dashboard/quotes', requiredPermissions: ['ViewMyQuotes', 'ViewOthersQuotes'] },
  {
    label: 'Purchase lists',
    href: '/dashboard/purchase-lists',
    requiredPermissions: ['ViewMyShoppingLists', 'ViewOthersShoppingLists'],
  },
  {
    label: 'Approval rules',
    href: '/dashboard/approval-rules',
    requiredPermissions: ['CreateApprovalRules', 'UpdateApprovalRules'],
  },
  { label: 'Approval flows', href: '/dashboard/approval-flows', requiredPermissions: ['UpdateApprovalFlows'] },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { hasAnyPermission } = usePermissions();

  const visible = NAV_ITEMS.filter(
    (item) => !item.requiredPermissions || hasAnyPermission(item.requiredPermissions)
  );

  return (
    <nav className="space-y-1">
      {visible.map((item) => {
        const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href as `/${string}`}
            className={cn(
              'block rounded-md px-3 py-2 text-sm',
              active ? 'bg-charcoal text-white' : 'text-charcoal-light hover:bg-cream-dark hover:text-charcoal'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
