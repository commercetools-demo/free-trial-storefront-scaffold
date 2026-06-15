import 'server-only';
import type {
  ProductProjection,
  ProductVariant,
  Price as CtPrice,
  ProductDiscount,
  LocalizedString,
  TypedMoney,
} from '@commercetools/platform-sdk';
import { getLocalizedString } from '@/lib/utils';
import type { Money, Price, Variant, Product } from '@/lib/types';

function mapMoney(money: TypedMoney): Money {
  return {
    centAmount: money.centAmount,
    currencyCode: money.currencyCode,
    fractionDigits: money.fractionDigits,
  };
}

function mapPrice(ctPrice: CtPrice, locale: string): Price {
  const discountObj = ctPrice.discounted?.discount?.obj as ProductDiscount | undefined;
  return {
    value: mapMoney(ctPrice.value),
    discounted: ctPrice.discounted
      ? {
          value: mapMoney(ctPrice.discounted.value),
          discountName: getLocalizedString(
            discountObj?.name as LocalizedString | undefined,
            locale,
          ),
        }
      : undefined,
  };
}

export function mapVariant(v: ProductVariant, locale: string): Variant {
  return {
    id: v.id,
    sku: v.sku,
    images: (v.images ?? []).map((img) => img.url),
    price: v.price ? mapPrice(v.price, locale) : undefined,
    prices: (v.prices ?? []).map((p) => mapPrice(p, locale)),
    attributes: (v.attributes ?? []).map((a) => ({ name: a.name, value: a.value })),
    isOnStock: v.availability?.isOnStock ?? true,
    isMatching: v.isMatchingVariant,
  };
}

export function mapProduct(p: ProductProjection, locale: string): Product {
  return {
    id: p.id,
    name: getLocalizedString(p.name as LocalizedString, locale),
    slug: getLocalizedString(p.slug as LocalizedString, locale),
    description: getLocalizedString(p.description as LocalizedString | undefined, locale),
    metaTitle: getLocalizedString(p.metaTitle as LocalizedString | undefined, locale) || undefined,
    metaDescription:
      getLocalizedString(p.metaDescription as LocalizedString | undefined, locale) || undefined,
    categories: (p.categories ?? []).map((c) => ({ id: c.id })),
    masterVariant: mapVariant(p.masterVariant, locale),
    variants: (p.variants ?? []).map((v) => mapVariant(v, locale)),
  };
}
