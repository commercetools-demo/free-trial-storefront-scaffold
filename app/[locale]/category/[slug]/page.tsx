import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getCategoryBySlug, getCategoryTree, findCategoryPath } from '@/lib/ct/categories';
import { searchProducts } from '@/lib/ct/search';
import CatalogView from '@/components/product/CatalogView';
import type { Category } from '@/lib/types';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function extractFilters(sp: Record<string, string | string[] | undefined>) {
  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (k.startsWith('f_') && typeof v === 'string') filters[k.slice(2)] = v;
  }
  return filters;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getLocale();
  const category = await getCategoryBySlug(slug, locale).catch(() => null);
  if (!category) return {};
  return { title: category.name, description: category.description ?? `Shop ${category.name}` };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const { locale, currency, country } = await getLocale();

  const [category, categoryTree] = await Promise.all([
    getCategoryBySlug(slug, locale),
    getCategoryTree(locale).catch(() => [] as Category[]),
  ]);
  if (!category) notFound();

  const breadcrumb = findCategoryPath(categoryTree, category.id);
  const offset = Number(sp.offset ?? 0) || 0;
  const sort = typeof sp.sort === 'string' ? sp.sort : undefined;

  const result = await searchProducts({
    categoryId: category.id,
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
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink/50">
        <Link href="/" className="hover:text-violet">Home</Link>
        {breadcrumb.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5">
            <span>/</span>
            <Link href={`/category/${c.slug}`} className="hover:text-violet">
              {c.name}
            </Link>
          </span>
        ))}
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-ink/60">{category.description}</p>
        )}
      </header>

      <Suspense fallback={<div className="py-24 text-center text-ink/40">Loading…</div>}>
        <CatalogView result={result} />
      </Suspense>
    </div>
  );
}
