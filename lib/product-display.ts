import type { Product, Variant, Money } from './types';

/** Pick the variant to feature on a card / by SKU on a PDP. */
export function pickVariant(product: Product, sku?: string): Variant {
  if (sku) {
    const match = [product.masterVariant, ...product.variants].find((v) => v.sku === sku);
    if (match) return match;
  }
  // Prefer the matching variant flagged by the search API, else master.
  const matching = product.variants.find((v) => v.isMatching);
  return matching ?? product.masterVariant;
}

export interface DisplayPrice {
  current?: Money;
  original?: Money;
  isDiscounted: boolean;
}

export function getDisplayPrice(variant: Variant): DisplayPrice {
  const price = variant.price ?? variant.prices[0];
  if (!price) return { isDiscounted: false };
  if (price.discounted) {
    return { current: price.discounted.value, original: price.value, isDiscounted: true };
  }
  return { current: price.value, isDiscounted: false };
}

export function discountPercent(p: DisplayPrice): number | null {
  if (!p.isDiscounted || !p.current || !p.original) return null;
  const pct = Math.round((1 - p.current.centAmount / p.original.centAmount) * 100);
  return pct > 0 ? pct : null;
}
