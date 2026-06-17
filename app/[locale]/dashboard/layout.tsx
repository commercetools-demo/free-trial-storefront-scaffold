'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { Spinner, EmptyState } from '@/components/ui';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAccount();
  const { currentBusinessUnit, businessUnits, isLoading: buLoading } = useBusinessUnit();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login?redirect=/dashboard');
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-terra" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-charcoal-light">
            {currentBusinessUnit?.name ?? 'Dashboard'}
          </h2>
          <DashboardNav />
        </aside>
        <main className="min-w-0">
          {!currentBusinessUnit ? (
            buLoading ? (
              <div className="flex justify-center py-24">
                <Spinner className="text-terra" />
              </div>
            ) : (
              <EmptyState
                title="No business unit available"
                description={
                  businessUnits.length === 0
                    ? 'You are not assigned to any business unit yet. A seller must add you as an associate.'
                    : 'Select a business unit from the header to continue.'
                }
              />
            )
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
