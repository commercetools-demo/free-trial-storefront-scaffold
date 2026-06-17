import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getProductBySku } from '@/lib/ct/search';
import { getAttributeLabels } from '@/lib/ct/attribute-labels';
import { PDP_INFO_ATTRIBUTES } from '@/lib/ct/variant-config';
import { attrLabel } from '@/lib/attr';
import { ImageGallery } from '@/components/product/ImageGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { HeartButton } from '@/components/product/HeartButton';
import { PriceDisplay } from '@/components/ui/Price';

type Props = { params: Promise<{ locale: string; sku: string }> };

// Dedup the fetch between generateMetadata and the page (same request).
const loadProduct = cache(async (sku: string, locale: string, currency: string, country: string) =>
  getProductBySku(sku, locale, currency, country).catch(() => null)
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const { locale, currency, country } = await getLocale();
  const product = await loadProduct(sku, locale, currency, country);
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.description?.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { sku } = await params;
  const t = await getTranslations('pdp');
  const { locale, currency, country } = await getLocale();

  const [product, labels] = await Promise.all([
    loadProduct(sku, locale, currency, country),
    getAttributeLabels(locale),
  ]);

  if (!product) notFound();

  const variant = product.variants.find((v) => v.sku === sku) ?? product.variants[0];
  const inStock = variant?.availability?.isOnStock ?? false;
  const hasPrice = !!variant?.price;

  const infoAttrs = (variant?.attributes ?? []).filter(
    (a) => PDP_INFO_ATTRIBUTES.includes(a.name) && a.value != null && String(a.value).trim() !== ''
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-charcoal-light">
        <Link href="/" className="hover:text-terra">{t('home')}</Link>
        <span aria-hidden>/</span>
        <span className="text-charcoal line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <ImageGallery images={variant?.images ?? []} alt={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-charcoal md:text-3xl">{product.name}</h1>
            {variant?.sku && <p className="mt-1 text-sm text-charcoal-light">{t('sku', { sku: variant.sku })}</p>}
          </div>

          <div className="flex items-center gap-4">
            <PriceDisplay price={variant?.price} className="text-xl" />
            <span
              className={`text-sm ${inStock ? 'text-sage' : 'text-terra'}`}
            >
              {inStock ? t('inStock') : t('outOfStock')}
            </span>
          </div>

          <VariantSelector variants={product.variants} currentSku={variant?.sku ?? sku} labels={labels} />

          <div className="flex items-center gap-3">
            <div className="flex-1">
              {variant && (
                <AddToCartButton
                  productId={product.id}
                  variantId={variant.id}
                  inStock={inStock}
                  hasPrice={hasPrice}
                />
              )}
            </div>
            {variant && (
              <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-border">
                <HeartButton productId={product.id} variantId={variant.id} size={22} />
              </span>
            )}
          </div>

          {product.description && (
            <div className="border-t border-border pt-6">
              <h2 className="mb-2 text-sm font-medium text-charcoal">{t('description')}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal-light">
                {product.description}
              </p>
            </div>
          )}

          {infoAttrs.length > 0 && (
            <div className="border-t border-border pt-6">
              <dl className="space-y-3">
                {infoAttrs.map((a) => (
                  <div key={a.name}>
                    <dt className="text-sm font-medium text-charcoal">{labels[a.name] ?? a.name}</dt>
                    <dd className="mt-1 whitespace-pre-line text-sm text-charcoal-light">
                      {attrLabel(a.value, locale)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
