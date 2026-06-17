import { getSession } from '@/lib/session';
import { searchProducts } from '@/lib/ct/products';
import type { ProductQuery } from '@/lib/ct/product-api';
import { ProductGrid } from '@/components/product/ProductGrid';
import { PlpToolbar } from '@/components/product/PlpToolbar';
import { Pagination } from '@/components/product/Pagination';
import { Alert } from '@/components/ui';

const PAGE_SIZE = 24;

function parseSort(sort: string | undefined, lang: string): ProductQuery['sort'] {
  switch (sort) {
    case 'name-asc':
      return { field: `name.${lang}`, order: 'asc' };
    case 'price-asc':
      return { field: 'variants.prices.centAmount', order: 'asc' };
    case 'price-desc':
      return { field: 'variants.prices.centAmount', order: 'desc' };
    default:
      return undefined;
  }
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { q, sort, page } = await searchParams;
  const session = await getSession();

  const lang = locale.split('-')[0];
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const query: ProductQuery = {
    query: q,
    sort: parseSort(sort, lang),
    limit: PAGE_SIZE,
    offset,
  };

  let result;
  try {
    result = await searchProducts(query, session);
  } catch {
    // Retry once without sort/facets so products always render.
    result = await searchProducts({ ...query, sort: undefined }, session);
  }

  const baseParams: Record<string, string> = {};
  if (q) baseParams.q = q;
  if (sort) baseParams.sort = sort;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Products</h1>
        <span className="text-sm text-charcoal-light">{result.total} items</span>
      </div>

      <div className="mb-6">
        <PlpToolbar initialQuery={q ?? ''} initialSort={sort ?? ''} />
      </div>

      {!session.storeKey && (
        <div className="mb-6">
          <Alert tone="info">
            Sign in and select a business unit to see your negotiated, store-scoped pricing.
          </Alert>
        </div>
      )}

      <ProductGrid products={result.products} locale={locale} />

      <Pagination total={result.total} limit={PAGE_SIZE} offset={offset} baseParams={baseParams} />
    </div>
  );
}
