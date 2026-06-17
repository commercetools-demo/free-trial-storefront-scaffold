import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getLocale } from '@/lib/session';
import { searchProducts } from '@/lib/ct/search';
import { getAttributeLabels } from '@/lib/ct/attribute-labels';
import { parseSearchParams, type RawSearchParams } from '@/lib/search-params';
import { SearchResultsView } from '@/components/product/SearchResultsView';

type Props = { searchParams: Promise<RawSearchParams> };

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({ searchParams }: Props) {
  const t = await getTranslations('search');
  const { locale, currency, country } = await getLocale();
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '';
  const { selections, sort, offset, limit } = parseSearchParams(sp);

  const [results, labels] = await Promise.all([
    searchProducts({ text: q, locale, currency, country, sort, offset, limit, selections }),
    getAttributeLabels(locale),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-semibold text-charcoal">
        {q ? t('resultsFor', { q }) : t('allProducts')}
      </h1>
      <p className="mb-8 text-sm text-charcoal-light">{t('productCount', { count: results.total })}</p>

      <SearchResultsView
        products={results.products}
        facets={results.facets}
        labels={labels}
        total={results.total}
        limit={results.limit}
        offset={results.offset}
      />
    </div>
  );
}
