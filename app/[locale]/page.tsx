import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getCategoryTree } from '@/lib/ct/categories';
import { searchProducts } from '@/lib/ct/search';
import { ProductGrid } from '@/components/product/ProductGrid';

export default async function HomePage() {
  const t = await getTranslations('home');
  const { locale, currency, country } = await getLocale();

  const [tree, featured] = await Promise.all([
    getCategoryTree(locale),
    searchProducts({ locale, currency, country, limit: 8, withFacets: false, sort: 'name-asc' }),
  ]);

  // Surface a handful of well-populated root categories that have a slug.
  const featuredCategories = tree.filter((c) => c.slug).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-cream-dark">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-charcoal md:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-charcoal-light">
            {t('heroSubtitle')}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/search"
              className="rounded-sm bg-charcoal px-6 py-3 text-sm font-medium text-cream hover:bg-charcoal-light"
            >
              {t('shopAll')}
            </Link>
            {featuredCategories[0] && (
              <Link
                href={`/category/${featuredCategories[0].slug}`}
                className="rounded-sm border border-charcoal px-6 py-3 text-sm font-medium text-charcoal hover:bg-charcoal hover:text-cream"
              >
                {t('explore', { category: featuredCategories[0].name })}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      {featuredCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-semibold text-charcoal">{t('shopByCategory')}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex items-center justify-between rounded-sm border border-border bg-cream px-6 py-8 hover:border-charcoal"
              >
                <span className="text-lg font-medium text-charcoal group-hover:text-terra">
                  {cat.name}
                </span>
                <span aria-hidden className="text-charcoal-light transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold text-charcoal">{t('featured')}</h2>
          <Link href="/search" className="text-sm text-terra hover:underline">
            {t('viewAll')}
          </Link>
        </div>
        <ProductGrid products={featured.products} />
      </section>
    </div>
  );
}
