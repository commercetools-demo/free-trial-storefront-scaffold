import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getCategoryBySlug, getCategoryTree, buildBreadcrumb } from '@/lib/ct/categories';
import { searchProducts } from '@/lib/ct/search';
import { getAttributeLabels } from '@/lib/ct/attribute-labels';
import { parseSearchParams, type RawSearchParams } from '@/lib/search-params';
import { SearchResultsView } from '@/components/product/SearchResultsView';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const category = await getCategoryBySlug(slug, locale).catch(() => null);
  if (!category) return {};
  return { title: category.name };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const t = await getTranslations('plp');
  const { locale, currency, country } = await getLocale();
  const sp = await searchParams;
  const { selections, sort, offset, limit } = parseSearchParams(sp);

  const [category, tree, labels] = await Promise.all([
    getCategoryBySlug(slug, locale),
    getCategoryTree(locale),
    getAttributeLabels(locale),
  ]);

  if (!category) notFound();

  const breadcrumb = buildBreadcrumb(tree, category.id);

  const results = await searchProducts({
    categoryId: category.id,
    locale,
    currency,
    country,
    sort,
    offset,
    limit,
    selections,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-charcoal-light">
        <Link href="/" className="hover:text-terra">{t('home')}</Link>
        {breadcrumb.map((c) => (
          <span key={c.id} className="flex items-center gap-1">
            <span aria-hidden>/</span>
            {c.slug ? (
              <Link href={`/category/${c.slug}`} className="hover:text-terra">{c.name}</Link>
            ) : (
              <span>{c.name}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="mb-8 text-3xl font-semibold text-charcoal">{category.name}</h1>

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
