import { apiRoot } from './client';
import { mapPurchaseList } from '@/lib/mappers/shoppingList';
import type { PurchaseList } from '@/lib/types';
import type { ShoppingListUpdateAction } from '@commercetools/platform-sdk';

// All purchase-list operations go through the as-associate chain — commercetools
// enforces BU membership, so no app-level ownership checks are needed.
function lists(associateId: string, businessUnitKey: string) {
  return apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .shoppingLists();
}

const EXPAND = ['lineItems[*].variant'];

export async function getPurchaseLists(
  associateId: string,
  businessUnitKey: string,
  locale?: string
): Promise<PurchaseList[]> {
  const { body } = await lists(associateId, businessUnitKey)
    .get({ queryArgs: { limit: 100, sort: 'createdAt desc', expand: EXPAND } })
    .execute();
  return body.results.map((l) => mapPurchaseList(l, locale));
}

export async function getPurchaseListById(
  associateId: string,
  businessUnitKey: string,
  id: string,
  locale?: string
): Promise<PurchaseList> {
  const { body } = await lists(associateId, businessUnitKey)
    .withId({ ID: id })
    .get({ queryArgs: { expand: EXPAND } })
    .execute();
  return mapPurchaseList(body, locale);
}

export async function createPurchaseList(
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  customerId: string,
  name: string,
  description?: string,
  locale = 'en-US'
): Promise<PurchaseList> {
  const { body } = await lists(associateId, businessUnitKey)
    .post({
      body: {
        name: { [locale]: name },
        ...(description ? { description: { [locale]: description } } : {}),
        customer: { id: customerId, typeId: 'customer' },
        store: { key: storeKey, typeId: 'store' },
      },
    })
    .execute();
  return mapPurchaseList(body, locale);
}

async function update(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number,
  actions: ShoppingListUpdateAction[],
  locale?: string
): Promise<PurchaseList> {
  const { body } = await lists(associateId, businessUnitKey)
    .withId({ ID: id })
    .post({ body: { version, actions } })
    .execute();
  return mapPurchaseList(body, locale);
}

export async function addPurchaseListItem(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number,
  productId: string,
  variantId: number,
  quantity = 1,
  locale?: string
): Promise<PurchaseList> {
  return update(
    associateId,
    businessUnitKey,
    id,
    version,
    [{ action: 'addLineItem', productId, variantId, quantity }],
    locale
  );
}

export async function removePurchaseListItem(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number,
  lineItemId: string,
  locale?: string
): Promise<PurchaseList> {
  return update(associateId, businessUnitKey, id, version, [{ action: 'removeLineItem', lineItemId }], locale);
}

export async function deletePurchaseList(
  associateId: string,
  businessUnitKey: string,
  id: string,
  version: number
): Promise<void> {
  await lists(associateId, businessUnitKey).withId({ ID: id }).delete({ queryArgs: { version } }).execute();
}
