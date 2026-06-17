import type {
  ProductProjection,
  ProductVariant,
  Price as CtPrice,
} from '@commercetools/platform-sdk';
import type { Product, Variant, Price } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

function mapPrice(price?: CtPrice): Price | undefined {
  if (!price) return undefined;
  return {
    centAmount: price.value.centAmount,
    currencyCode: price.value.currencyCode,
    discounted: price.discounted
      ? {
          centAmount: price.discounted.value.centAmount,
          currencyCode: price.discounted.value.currencyCode,
        }
      : undefined,
  };
}

function mapVariant(variant: ProductVariant, locale: string, supplyChannelId?: string): Variant {
  const prices = (variant.prices ?? []).map(mapPrice).filter(Boolean) as Price[];
  // `scopedPrice` (from priceSelection) or `price` (from price* params) is the
  // resolved, session-scoped price commercetools picked for this query.
  const scoped = mapPrice(variant.scopedPrice ?? variant.price);

  const channelAvailability = supplyChannelId
    ? variant.availability?.channels?.[supplyChannelId]
    : variant.availability;

  return {
    id: variant.id,
    sku: variant.sku ?? '',
    images: (variant.images ?? []).map((img) => img.url),
    price: scoped ?? prices[0],
    prices,
    attributes: (variant.attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
    availability: {
      isOnStock: channelAvailability?.isOnStock ?? variant.availability?.isOnStock ?? false,
      availableQuantity:
        channelAvailability?.availableQuantity ?? variant.availability?.availableQuantity,
    },
  };
}

export function mapProduct(
  projection: ProductProjection,
  matchingVariantIds: Set<number> | null,
  locale: string,
  supplyChannelId?: string
): Product {
  const allVariants = [projection.masterVariant, ...(projection.variants ?? [])];
  const variants = allVariants.map((v) => mapVariant(v, locale, supplyChannelId));

  return {
    type: 'Product',
    id: projection.id,
    name: getLocalizedString(projection.name as Record<string, string>, locale),
    slug: getLocalizedString(projection.slug as Record<string, string>, locale),
    description: projection.description
      ? getLocalizedString(projection.description as Record<string, string>, locale)
      : undefined,
    categories: (projection.categories ?? []).map((c) => ({ id: c.id })),
    variants,
    matchingVariantIds: matchingVariantIds ? Array.from(matchingVariantIds) : undefined,
  };
}
