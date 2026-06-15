import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getProductBySku, getAttributeLabels } from '@/lib/ct/search';
import { formatMoney } from '@/lib/utils';
import { pickVariant, getDisplayPrice, discountPercent } from '@/lib/product-display';
import ProductGallery from '@/components/product/ProductGallery';
import VariantSelector from '@/components/product/VariantSelector';
import AddToCartButton from '@/components/product/AddToCartButton';
import WishlistHeart from '@/components/product/WishlistHeart';
import ProductAttributes from '@/components/product/ProductAttributes';
import Badge from '@/components/ui/Badge';

type PageProps = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sku } = await params;
  const { locale, currency, country } = await getLocale();
  const product = await getProductBySku(sku, locale, currency, country).catch(() => null);
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { sku } = await params;
  const { locale, currency, country } = await getLocale();

  const [product, labels] = await Promise.all([
    getProductBySku(sku, locale, currency, country).catch(() => null),
    getAttributeLabels(locale).catch(() => ({})),
  ]);
  if (!product) notFound();

  const variant = pickVariant(product, sku);
  const price = getDisplayPrice(variant);
  const pct = discountPercent(price);
  const allVariants = [product.masterVariant, ...product.variants];
  const hasPrice = Boolean(price.current);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-ink/50">
        <Link href="/" className="hover:text-violet">Home</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-violet">Shop</Link>
        <span>/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery key={variant.sku} images={variant.images} alt={product.name} />

        <div className="lg:py-4">
          {pct && <Badge variant="hot" className="mb-3">-{pct}% OFF</Badge>}
          <h1 className="text-3xl font-black tracking-tight lg:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-ink">{formatMoney(price.current, locale)}</span>
            {price.isDiscounted && (
              <span className="text-lg text-ink/40 line-through">
                {formatMoney(price.original, locale)}
              </span>
            )}
          </div>

          <div className="mt-2">
            {variant.isOnStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sage">
                <span className="h-2 w-2 rounded-full bg-green-500" /> In stock
              </span>
            ) : (
              <span className="text-sm font-semibold text-red-500">Out of stock</span>
            )}
          </div>

          {product.description && (
            <p className="mt-5 text-ink/70 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6">
            <VariantSelector variants={allVariants} activeSku={variant.sku} />
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1">
              <AddToCartButton
                productId={product.id}
                variantId={variant.id}
                outOfStock={!variant.isOnStock}
                disabled={!hasPrice}
              />
            </div>
            <WishlistHeart productId={product.id} variantId={variant.id} size="lg" className="!p-3.5 border border-border" />
          </div>

          <ProductAttributes attributes={variant.attributes} labels={labels} />
        </div>
      </div>
    </div>
  );
}
