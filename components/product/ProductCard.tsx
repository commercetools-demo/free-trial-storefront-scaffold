'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useLocale } from '@/context/LocaleContext';
import { formatMoney } from '@/lib/utils';
import { pickVariant, getDisplayPrice, discountPercent } from '@/lib/product-display';
import Badge from '@/components/ui/Badge';
import WishlistHeart from './WishlistHeart';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const { locale } = useLocale();
  const variant = pickVariant(product);
  const price = getDisplayPrice(variant);
  const pct = discountPercent(price);
  const image = variant.images[0];
  const href = variant.sku ? `/p/${variant.sku}` : `/p/${product.masterVariant.sku ?? ''}`;

  return (
    <div className="group relative">
      <Link href={href} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-mist">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink/30">
              No image
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {pct && <Badge variant="hot">-{pct}%</Badge>}
            {!variant.isOnStock && <Badge variant="error">Sold out</Badge>}
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3">
        <WishlistHeart productId={product.id} variantId={variant.id} />
      </div>

      <Link href={href} className="mt-3 block">
        <h3 className="line-clamp-1 text-sm font-semibold text-ink group-hover:text-violet">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-ink">{formatMoney(price.current, locale)}</span>
          {price.isDiscounted && (
            <span className="text-xs text-ink/40 line-through">
              {formatMoney(price.original, locale)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
