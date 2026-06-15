import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getCategoryTree } from '@/lib/ct/categories';
import { searchProducts } from '@/lib/ct/search';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/ui/Button';
import { ArrowRight, TruckIcon, SparkleIcon, HeartIcon } from '@/components/ui/icons';
import type { Category, ProductSearchResponse } from '@/lib/types';

const TILE_GRADIENTS = [
  'from-magenta to-violet',
  'from-violet to-cyan',
  'from-cyan to-lime',
  'from-sun to-magenta',
  'from-violet-dark to-magenta',
  'from-lime to-cyan',
];

export default async function HomePage() {
  const { locale, currency, country } = await getLocale();

  const [categoryTree, featured, fresh] = await Promise.all([
    getCategoryTree(locale).catch(() => [] as Category[]),
    searchProducts({ locale, currency, country, limit: 8, sort: 'newest', withFacets: false }).catch(
      () => ({ products: [], total: 0, offset: 0, limit: 8, facets: [] }) as ProductSearchResponse,
    ),
    searchProducts({ locale, currency, country, limit: 4, withFacets: false }).catch(
      () => ({ products: [], total: 0, offset: 0, limit: 4, facets: [] }) as ProductSearchResponse,
    ),
  ]);

  const topCategories = categoryTree.slice(0, 6);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-aurora-animated opacity-95" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-float" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-lime/30 blur-3xl animate-float" />

        <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-24 lg:py-36 text-white">
          <p className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur">
            <SparkleIcon width={16} height={16} /> NEW SEASON · SUMMER GLOW
          </p>
          <h1 className="animate-fade-up max-w-3xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
            Fashion that
            <br /> actually glows.
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-lg text-white/85">
            Bold colours, statement silhouettes, and pieces designed to be seen. Discover the LUMINA
            collection.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap gap-3">
            <Link href={topCategories[0] ? `/category/${topCategories[0].slug}` : '/search'}>
              <Button variant="secondary" size="lg" className="!bg-ink hover:!bg-white hover:!text-ink">
                Shop the drop <ArrowRight width={18} height={18} />
              </Button>
            </Link>
            <Link href="/search">
              <Button
                variant="outline"
                size="lg"
                className="!border-white !text-white hover:!bg-white hover:!text-ink"
              >
                Explore all
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== VALUE STRIP ===== */}
      <section className="border-b border-border bg-mist/50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 lg:px-8 py-6 sm:grid-cols-3">
          {[
            { icon: <TruckIcon width={20} height={20} />, t: 'Free shipping over $75', s: 'Fast, tracked delivery' },
            { icon: <SparkleIcon width={20} height={20} />, t: 'New drops weekly', s: 'Always something fresh' },
            { icon: <HeartIcon width={20} height={20} />, t: 'Loved by thousands', s: 'Join the LUMINA crew' },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-aurora text-white">
                {v.icon}
              </span>
              <div>
                <p className="text-sm font-bold">{v.t}</p>
                <p className="text-xs text-ink/50">{v.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORY TILES ===== */}
      {topCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl font-black tracking-tight">Shop by category</h2>
            <Link href="/search" className="text-sm font-semibold text-violet hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {topCategories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`group relative flex h-44 items-end overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white ${
                  TILE_GRADIENTS[i % TILE_GRADIENTS.length]
                }`}
              >
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20 blur-xl transition group-hover:scale-150" />
                <div className="relative">
                  <h3 className="text-xl font-black">{cat.name}</h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold opacity-90">
                    Shop now <ArrowRight width={16} height={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== FEATURED ===== */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-magenta">Just dropped</p>
            <h2 className="text-3xl font-black tracking-tight">New arrivals</h2>
          </div>
          <Link href="/search?sort=newest" className="text-sm font-semibold text-violet hover:underline">
            See more
          </Link>
        </div>
        <ProductGrid products={featured.products} />
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-center text-white lg:py-24">
          <div className="absolute inset-0 bg-aurora-animated opacity-30" />
          <div className="relative">
            <h2 className="text-4xl font-black sm:text-6xl">UP TO 40% OFF</h2>
            <p className="mt-3 text-lg text-white/80">Summer styles, glowing prices. Limited time.</p>
            <Link href="/search" className="mt-8 inline-block">
              <Button variant="primary" size="lg">
                Shop the sale <ArrowRight width={18} height={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== MORE TO LOVE ===== */}
      {fresh.products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 lg:px-8 pb-8">
          <h2 className="mb-8 text-3xl font-black tracking-tight">More to love</h2>
          <ProductGrid products={fresh.products} />
        </section>
      )}
    </div>
  );
}
