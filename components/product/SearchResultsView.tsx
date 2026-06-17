import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Product, FacetResult } from '@/lib/types';
import { ProductGrid } from './ProductGrid';
import { FacetPanel } from './FacetPanel';
import { SortSelect } from './SortSelect';
import { Pagination } from './Pagination';

export async function SearchResultsView({
  products,
  facets,
  labels,
  total,
  limit,
  offset,
}: {
  products: Product[];
  facets: FacetResult[];
  labels: Record<string, string>;
  total: number;
  limit: number;
  offset: number;
}) {
  const t = await getTranslations('plp');
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <Suspense fallback={null}>
          <FacetPanel facets={facets} labels={labels} />
        </Suspense>
      </div>
      <div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-charcoal-light">
            {total > 0 ? t('showing', { from, to, total }) : t('noResults')}
          </p>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>
        <ProductGrid products={products} />
        <Suspense fallback={null}>
          <Pagination total={total} limit={limit} offset={offset} />
        </Suspense>
      </div>
    </div>
  );
}
