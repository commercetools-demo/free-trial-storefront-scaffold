import 'server-only';
import type { ShoppingList, ShoppingListUpdateAction } from '@commercetools/platform-sdk';
import { apiRoot } from './client';

const LIST_EXPAND = ['lineItems[*].variant'];

/** All wishlists owned by a customer (project-level chain — B2C). */
export async function getWishlists(customerId: string): Promise<ShoppingList[]> {
  const { body } = await apiRoot
    .shoppingLists()
    .get({
      queryArgs: {
        where: `customer(id="${customerId}")`,
        sort: 'lastModifiedAt desc',
        expand: LIST_EXPAND,
        limit: 50,
      },
    })
    .execute();
  return body.results;
}

/** Fetch a single wishlist; enforce ownership in app code (return null on mismatch). */
export async function getWishlistById(
  id: string,
  customerId: string,
): Promise<ShoppingList | null> {
  try {
    const { body } = await apiRoot
      .shoppingLists()
      .withId({ ID: id })
      .get({ queryArgs: { expand: LIST_EXPAND } })
      .execute();
    if (body.customer?.id !== customerId) return null; // ID-guessing guard → 404
    return body;
  } catch {
    return null;
  }
}

export async function createWishlist(
  customerId: string,
  locale: string,
  name: string,
): Promise<ShoppingList> {
  const { body } = await apiRoot
    .shoppingLists()
    .post({
      body: {
        name: { [locale]: name },
        customer: { typeId: 'customer', id: customerId },
      },
      queryArgs: { expand: LIST_EXPAND },
    })
    .execute();
  return body;
}

async function update(
  id: string,
  version: number,
  actions: ShoppingListUpdateAction[],
): Promise<ShoppingList> {
  const { body } = await apiRoot
    .shoppingLists()
    .withId({ ID: id })
    .post({ body: { version, actions }, queryArgs: { expand: LIST_EXPAND } })
    .execute();
  return body;
}

export function renameWishlist(id: string, version: number, locale: string, name: string) {
  return update(id, version, [{ action: 'changeName', name: { [locale]: name } }]);
}

export function addWishlistItem(
  id: string,
  version: number,
  productId: string,
  variantId: number,
  quantity = 1,
) {
  return update(id, version, [{ action: 'addLineItem', productId, variantId, quantity }]);
}

export function removeWishlistItem(id: string, version: number, lineItemId: string) {
  return update(id, version, [{ action: 'removeLineItem', lineItemId }]);
}

export async function deleteWishlist(id: string, version: number): Promise<void> {
  await apiRoot.shoppingLists().withId({ ID: id }).delete({ queryArgs: { version } }).execute();
}
