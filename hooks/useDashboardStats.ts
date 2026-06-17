'use client';
import useSWR from 'swr';
import { useBusinessUnit } from '@/context/BusinessUnitContext';

export interface DashboardStats {
  orders: number;
  quotes: number;
  purchaseLists: number;
  pendingApprovals: number;
}

async function count(url: string, field: string): Promise<number> {
  try {
    const res = await fetch(url);
    if (!res.ok) return 0;
    const data = await res.json();
    return Array.isArray(data[field]) ? data[field].length : 0;
  } catch {
    return 0;
  }
}

export function useDashboardStats() {
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;
  const { data, isLoading } = useSWR<DashboardStats>(
    buKey ? ['dashboard-stats', buKey] : null,
    async () => {
      const [orders, quotes, purchaseLists, flows] = await Promise.all([
        count('/api/orders', 'orders'),
        count('/api/quotes', 'quotes'),
        count('/api/purchase-lists', 'purchaseLists'),
        count('/api/approval-flows?status=Pending', 'approvalFlows'),
      ]);
      return { orders, quotes, purchaseLists, pendingApprovals: flows };
    },
    { revalidateOnFocus: false }
  );
  return { stats: data, isLoading };
}
