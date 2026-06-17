'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { Product, Variant } from '@/lib/types';
import { formatMoney, formatAttributeValue } from '@/lib/utils';
import { useCartMutations } from '@/hooks/useCart';
import { useAccount } from '@/hooks/useAccount';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { Button, Badge, Alert } from '@/components/ui';
import { AddToPurchaseListButton } from '@/components/product/AddToPurchaseListButton';

// Attributes worth rendering as a spec table (skip noisy/internal ones).
const HIDDEN_ATTRIBUTES = new Set(['tags', 'relatedProducts']);

function variantLabel(v: Variant, locale: string): string {
  const distinguishing = v.attributes
    .filter((a) => !HIDDEN_ATTRIBUTES.has(a.name))
    .map((a) => formatAttributeValue(a.value, locale))
    .filter(Boolean);
  return distinguishing.length ? distinguishing.join(' · ') : v.sku;
}

export function ProductDetail({ product, locale }: { product: Product; locale: string }) {
  const [variant, setVariant] = useState<Variant>(product.variants[0]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<{ tone: 'success' | 'danger'; msg: string } | null>(null);
  const [adding, setAdding] = useState(false);

  const { addItem } = useCartMutations();
  const { user } = useAccount();
  const { currentBusinessUnit } = useBusinessUnit();

  const price = variant.price;
  const images = variant.images.length ? variant.images : product.variants[0].images;
  const onStock = variant.availability?.isOnStock;
  const canAddToCart = !!user && !!currentBusinessUnit;

  const specs = useMemo(
    () => variant.attributes.filter((a) => !HIDDEN_ATTRIBUTES.has(a.name)),
    [variant]
  );

  async function handleAddToCart() {
    setStatus(null);
    setAdding(true);
    try {
      await addItem(product.id, variant.id, quantity);
      setStatus({ tone: 'success', msg: `Added ${quantity} × ${product.name} to cart.` });
    } catch (e) {
      setStatus({ tone: 'danger', msg: e instanceof Error ? e.message : 'Failed to add to cart' });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-white">
          {images[activeImage] ? (
            <Image
              src={images[activeImage]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-charcoal-light">No image</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 overflow-hidden rounded border ${
                  i === activeImage ? 'border-terra' : 'border-border'
                }`}
              >
                <Image src={img} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">{product.name}</h1>
        <p className="mt-1 text-sm text-charcoal-light">SKU: {variant.sku}</p>

        <div className="mt-4">
          {price ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-charcoal">
                {formatMoney(
                  (price.discounted ?? price).centAmount,
                  (price.discounted ?? price).currencyCode,
                  locale
                )}
              </span>
              {price.discounted && (
                <span className="text-base text-charcoal-light line-through">
                  {formatMoney(price.centAmount, price.currencyCode, locale)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-lg text-charcoal-light">Price on request</span>
          )}
          <div className="mt-1">
            {onStock != null && (
              <Badge tone={onStock ? 'success' : 'neutral'}>
                {onStock
                  ? variant.availability?.availableQuantity != null
                    ? `${variant.availability.availableQuantity} in stock`
                    : 'In stock'
                  : 'Out of stock'}
              </Badge>
            )}
          </div>
        </div>

        {product.description && (
          <p className="mt-4 text-sm leading-relaxed text-charcoal-light">{product.description}</p>
        )}

        {/* Variant selector */}
        {product.variants.length > 1 && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-charcoal mb-2">Variant</label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setVariant(v);
                    setActiveImage(0);
                  }}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    v.id === variant.id
                      ? 'border-terra bg-terra/5 text-charcoal'
                      : 'border-border text-charcoal-light hover:border-charcoal'
                  }`}
                >
                  {variantLabel(v, locale)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + actions */}
        <div className="mt-6 flex items-end gap-3">
          <div>
            <label htmlFor="qty" className="block text-sm font-medium text-charcoal mb-1">
              Quantity
            </label>
            <input
              id="qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-24 rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-terra focus:outline-none"
            />
          </div>
          <Button onClick={handleAddToCart} disabled={!canAddToCart || adding} size="lg">
            {adding ? 'Adding…' : 'Add to cart'}
          </Button>
          <AddToPurchaseListButton productId={product.id} variantId={variant.id} disabled={!canAddToCart} />
        </div>

        {!canAddToCart && (
          <p className="mt-3 text-sm text-charcoal-light">
            Sign in and select a business unit to add items to a cart.
          </p>
        )}
        {status && (
          <div className="mt-4">
            <Alert tone={status.tone === 'success' ? 'success' : 'danger'}>{status.msg}</Alert>
          </div>
        )}

        {/* Specs */}
        {specs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-charcoal">Specifications</h2>
            <dl className="mt-3 divide-y divide-border border-t border-border text-sm">
              {specs.map((a) => (
                <div key={a.name} className="flex justify-between py-2">
                  <dt className="text-charcoal-light capitalize">{a.name}</dt>
                  <dd className="text-charcoal text-right">{formatAttributeValue(a.value, locale)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
