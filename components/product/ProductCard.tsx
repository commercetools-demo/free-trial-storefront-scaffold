import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { Product } from '@/lib/types';
import { PriceDisplay } from '@/components/ui/Price';
import { HeartButton } from './HeartButton';

export async function ProductCard({ product }: { product: Product }) {
  const t = await getTranslations('product');
  // prefer the matching variant (when variant filters are active), else master
  const variant = product.variants.find((v) => v.isMatching) ?? product.variants[0];
  const image = variant?.images[0];
  const href = `/product/${variant?.sku ?? product.variants[0]?.sku}`;
  const onSale = !!variant?.price?.discounted;

  return (
    <div className="group relative flex flex-col">
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-dark">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-charcoal-light text-sm">
              {t('noImage')}
            </div>
          )}
          {onSale && (
            <span className="absolute left-2 top-2 bg-terra px-2 py-0.5 text-xs font-medium text-cream rounded-sm">
              {t('sale')}
            </span>
          )}
        </div>
      </Link>
      {variant && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 max-md:opacity-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 shadow-sm">
            <HeartButton productId={product.id} variantId={variant.id} size={18} />
          </span>
        </div>
      )}
      <div className="mt-3 flex flex-col gap-1">
        <Link href={href} className="text-sm text-charcoal hover:text-terra line-clamp-2">
          {product.name}
        </Link>
        <PriceDisplay price={variant?.price} className="text-sm" />
      </div>
    </div>
  );
}
