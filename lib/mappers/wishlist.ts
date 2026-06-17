import 'server-only';
import type { ShoppingList, ShoppingListLineItem } from '@commercetools/platform-sdk';
import type { Wishlist, WishlistLineItem } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';
import { mapPrice } from './product';

function mapItem(li: ShoppingListLineItem, locale: string): WishlistLineItem {
  const variant = li.variant;
  return {
    lineItemId: li.id,
    productId: li.productId,
    variantId: li.variantId ?? variant?.id ?? 1,
    quantity: li.quantity,
    name: getLocalizedString(li.name, locale),
    slug: li.productSlug ? getLocalizedString(li.productSlug, locale) : undefined,
    image: variant?.images?.[0]?.url,
    price: mapPrice(variant?.price, locale),
  };
}

export function mapWishlist(list: ShoppingList, locale: string): Wishlist {
  return {
    id: list.id,
    version: list.version,
    name: getLocalizedString(list.name, locale),
    lineItems: (list.lineItems ?? []).map((li) => mapItem(li, locale)),
  };
}
