import 'server-only';
import type { ShoppingList } from '@commercetools/platform-sdk';
import { apiRoot } from './client';

const EXPAND = ['lineItems[*].variant'];

export async function listWishlists(customerId: string): Promise<ShoppingList[]> {
  const { body } = await apiRoot
    .shoppingLists()
    .get({
      queryArgs: {
        where: `customer(id="${customerId}")`,
        sort: 'lastModifiedAt desc',
        expand: EXPAND,
        limit: 50,
      },
    })
    .execute();
  return body.results;
}

/** Fetch one list by id and enforce ownership in app code (project-level endpoint isn't scoped). */
export async function getWishlistById(id: string, customerId: string): Promise<ShoppingList | null> {
  try {
    const { body } = await apiRoot
      .shoppingLists()
      .withId({ ID: id })
      .get({ queryArgs: { expand: EXPAND } })
      .execute();
    if (body.customer?.id !== customerId) return null; // ownership check → generic 404
    return body;
  } catch {
    return null;
  }
}

export async function createWishlist(
  customerId: string,
  name: string,
  locale: string
): Promise<ShoppingList> {
  const { body } = await apiRoot
    .shoppingLists()
    .post({
      body: {
        name: { [locale]: name },
        customer: { typeId: 'customer', id: customerId },
      },
    })
    .execute();
  return body;
}

export async function renameWishlist(
  id: string,
  version: number,
  name: string,
  locale: string
): Promise<ShoppingList> {
  const { body } = await apiRoot
    .shoppingLists()
    .withId({ ID: id })
    .post({ body: { version, actions: [{ action: 'changeName', name: { [locale]: name } }] } })
    .execute();
  return body;
}

export async function addWishlistItem(
  id: string,
  version: number,
  productId: string,
  variantId: number,
  quantity = 1
): Promise<ShoppingList> {
  const { body } = await apiRoot
    .shoppingLists()
    .withId({ ID: id })
    .post({
      body: { version, actions: [{ action: 'addLineItem', productId, variantId, quantity }] },
      queryArgs: { expand: EXPAND },
    })
    .execute();
  return body;
}

export async function removeWishlistItem(
  id: string,
  version: number,
  lineItemId: string
): Promise<ShoppingList> {
  const { body } = await apiRoot
    .shoppingLists()
    .withId({ ID: id })
    .post({
      body: { version, actions: [{ action: 'removeLineItem', lineItemId }] },
      queryArgs: { expand: EXPAND },
    })
    .execute();
  return body;
}

export async function deleteWishlist(id: string, version: number): Promise<void> {
  await apiRoot.shoppingLists().withId({ ID: id }).delete({ queryArgs: { version } }).execute();
}
