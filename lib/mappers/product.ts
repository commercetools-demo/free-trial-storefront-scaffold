import 'server-only';
import type {
  ProductProjection,
  ProductVariant,
  Price as CtPrice,
  ProductDiscount,
  LocalizedString,
  Attribute,
} from '@commercetools/platform-sdk';
import type { Price, Product, Variant, ProductAttribute } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

export function mapPrice(p: CtPrice | undefined, locale: string): Price | undefined {
  if (!p) return undefined;
  const discountObj = p.discounted?.discount?.obj as ProductDiscount | undefined;
  return {
    centAmount: p.value.centAmount,
    currencyCode: p.value.currencyCode,
    discounted: p.discounted
      ? {
          centAmount: p.discounted.value.centAmount,
          currencyCode: p.discounted.value.currencyCode,
          discountName: getLocalizedString(discountObj?.name as LocalizedString | undefined, locale),
        }
      : undefined,
  };
}

function mapAttributes(attrs: Attribute[] | undefined): ProductAttribute[] {
  return (attrs ?? []).map((a) => ({ name: a.name, value: a.value }));
}

export function mapVariant(v: ProductVariant, locale: string): Variant {
  return {
    id: v.id,
    sku: v.sku ?? '',
    images: (v.images ?? []).map((i) => i.url),
    price: mapPrice(v.price, locale),
    prices: (v.prices ?? []).map((p) => mapPrice(p, locale)!).filter(Boolean),
    attributes: mapAttributes(v.attributes),
    availability: v.availability ? { isOnStock: v.availability.isOnStock } : undefined,
    isMatching: v.isMatchingVariant,
  };
}

export function mapProduct(p: ProductProjection, locale: string): Product {
  const variants = [p.masterVariant, ...(p.variants ?? [])].map((v) => mapVariant(v, locale));
  return {
    type: 'Product',
    id: p.id,
    name: getLocalizedString(p.name as LocalizedString, locale),
    slug: getLocalizedString(p.slug as LocalizedString, locale),
    description: getLocalizedString(p.description as LocalizedString | undefined, locale) || undefined,
    metaTitle: getLocalizedString(p.metaTitle as LocalizedString | undefined, locale) || undefined,
    metaDescription:
      getLocalizedString(p.metaDescription as LocalizedString | undefined, locale) || undefined,
    categories: (p.categories ?? []).map((c) => ({ id: c.id })),
    variants,
  };
}
