import type { ShoppingList as CtShoppingList } from '@commercetools/platform-sdk';
import type { PurchaseList, PurchaseListItem } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

export function mapPurchaseList(list: CtShoppingList, locale = 'en-US'): PurchaseList {
  const items: PurchaseListItem[] = (list.lineItems ?? []).map((li) => ({
    id: li.id,
    productId: li.productId,
    variantId: li.variantId,
    name: getLocalizedString(li.name as Record<string, string>, locale),
    sku: li.variant?.sku,
    quantity: li.quantity,
    image: li.variant?.images?.[0]?.url,
  }));

  return {
    id: list.id,
    version: list.version,
    name: getLocalizedString(list.name as Record<string, string>, locale),
    description: list.description ? getLocalizedString(list.description as Record<string, string>, locale) : undefined,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    items,
    createdAt: list.createdAt,
  };
}
