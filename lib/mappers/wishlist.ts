import 'server-only';
import type {
  ShoppingList as CtShoppingList,
  ShoppingListLineItem,
  LocalizedString,
} from '@commercetools/platform-sdk';
import { getLocalizedString } from '@/lib/utils';
import type { Wishlist, WishlistItem } from '@/lib/types';

function mapItem(li: ShoppingListLineItem, locale: string): WishlistItem {
  const variant = li.variant;
  const price = variant?.prices?.[0]?.value ?? variant?.price?.value;
  return {
    lineItemId: li.id,
    productId: li.productId,
    variantId: li.variantId ?? variant?.id ?? 1,
    quantity: li.quantity,
    name: getLocalizedString(li.name as LocalizedString, locale),
    slug: getLocalizedString(li.productSlug as LocalizedString | undefined, locale) || undefined,
    sku: variant?.sku,
    image: variant?.images?.[0]?.url,
    price: price
      ? { centAmount: price.centAmount, currencyCode: price.currencyCode, fractionDigits: price.fractionDigits }
      : undefined,
  };
}

export function mapWishlist(list: CtShoppingList, locale: string): Wishlist {
  return {
    id: list.id,
    version: list.version,
    name: getLocalizedString(list.name as LocalizedString, locale),
    lineItems: (list.lineItems ?? []).map((li) => mapItem(li, locale)),
  };
}
