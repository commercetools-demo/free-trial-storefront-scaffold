import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getLocale } from '@/lib/session';
import { searchProducts } from '@/lib/ct/search';
import CatalogView from '@/components/product/CatalogView';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function extractFilters(sp: Record<string, string | string[] | undefined>) {
  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (k.startsWith('f_') && typeof v === 'string') filters[k.slice(2)] = v;
  }
  return filters;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  return { title: q ? `Search: ${q}` : 'Search' };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { locale, currency, country } = await getLocale();

  const q = typeof sp.q === 'string' ? sp.q : '';
  const offset = Number(sp.offset ?? 0) || 0;
  const sort = typeof sp.sort === 'string' ? sp.sort : undefined;

  const result = await searchProducts({
    text: q || undefined,
    locale,
    currency,
    country,
    limit: 24,
    offset,
    sort,
    filters: extractFilters(sp),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-magenta">Search</p>
        <h1 className="text-4xl font-black tracking-tight">
          {q ? (
            <>
              Results for <span className="text-gradient">“{q}”</span>
            </>
          ) : (
            'Explore everything'
          )}
        </h1>
      </header>

      <Suspense fallback={<div className="py-24 text-center text-ink/40">Loading…</div>}>
        <CatalogView result={result} />
      </Suspense>
    </div>
  );
}
