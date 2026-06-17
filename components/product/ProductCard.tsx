import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { Product } from '@/lib/types';
import { formatMoney } from '@/lib/utils';

export function ProductCard({ product, locale }: { product: Product; locale: string }) {
  const variant = product.variants[0];
  const price = variant?.price;
  const image = variant?.images[0];
  const onStock = variant?.availability?.isOnStock;

  return (
    <Link
      href={`/products/${product.slug}` as `/${string}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white transition hover:shadow-sm"
    >
      <div className="relative aspect-square w-full bg-cream-dark">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-4"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-charcoal-light">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-charcoal">{product.name}</h3>
        {variant?.sku && <p className="text-xs text-charcoal-light">SKU: {variant.sku}</p>}
        <div className="mt-auto pt-2">
          {price ? (
            <span className="text-base font-semibold text-charcoal">
              {price.discounted
                ? formatMoney(price.discounted.centAmount, price.discounted.currencyCode, locale)
                : formatMoney(price.centAmount, price.currencyCode, locale)}
            </span>
          ) : (
            <span className="text-sm text-charcoal-light">Price on request</span>
          )}
          {onStock != null && (
            <span className={`ml-2 text-xs ${onStock ? 'text-sage' : 'text-charcoal-light'}`}>
              {onStock ? 'In stock' : 'Out of stock'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
