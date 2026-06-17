import { apiRoot } from './client';
import { mapCart } from '@/lib/mappers/cart';
import { getStoreChannelData } from './stores';
import type { Address, Cart } from '@/lib/types';
import type { CartUpdateAction, BaseAddress } from '@commercetools/platform-sdk';

// Every B2B cart operation routes through the as-associate chain so that
// commercetools enforces associate permissions server-side.
function asAssociateCarts(associateId: string, businessUnitKey: string) {
  return apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .carts();
}

export async function getCart(
  cartId: string,
  associateId: string,
  businessUnitKey: string,
  locale?: string
): Promise<Cart> {
  const { body } = await asAssociateCarts(associateId, businessUnitKey)
    .withId({ ID: cartId })
    .get()
    .execute();
  return mapCart(body, locale);
}

export async function createCart(
  customerId: string,
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  currency = 'USD',
  country = 'US',
  locale?: string
): Promise<Cart> {
  const { body } = await asAssociateCarts(associateId, businessUnitKey)
    .post({
      body: {
        currency,
        country,
        customerId,
        businessUnit: { key: businessUnitKey, typeId: 'business-unit' },
        store: { key: storeKey, typeId: 'store' },
      },
    })
    .execute();
  return mapCart(body, locale);
}

export async function addLineItem(
  cartId: string,
  version: number,
  productId: string,
  variantId: number,
  quantity: number,
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  distributionChannelId?: string,
  locale?: string
): Promise<Cart> {
  const action: CartUpdateAction = {
    action: 'addLineItem',
    productId,
    variantId,
    quantity,
    ...(distributionChannelId
      ? { distributionChannel: { id: distributionChannelId, typeId: 'channel' } }
      : {}),
  };
  const { body } = await asAssociateCarts(associateId, businessUnitKey)
    .withId({ ID: cartId })
    .post({ body: { version, actions: [action] } })
    .execute();
  return mapCart(body, locale);
}

export async function changeLineItemQuantity(
  cartId: string,
  version: number,
  lineItemId: string,
  quantity: number,
  associateId: string,
  businessUnitKey: string,
  locale?: string
): Promise<Cart> {
  const { body } = await asAssociateCarts(associateId, businessUnitKey)
    .withId({ ID: cartId })
    .post({ body: { version, actions: [{ action: 'changeLineItemQuantity', lineItemId, quantity }] } })
    .execute();
  return mapCart(body, locale);
}

export async function removeLineItem(
  cartId: string,
  version: number,
  lineItemId: string,
  associateId: string,
  businessUnitKey: string,
  locale?: string
): Promise<Cart> {
  const { body } = await asAssociateCarts(associateId, businessUnitKey)
    .withId({ ID: cartId })
    .post({ body: { version, actions: [{ action: 'removeLineItem', lineItemId }] } })
    .execute();
  return mapCart(body, locale);
}

function toBaseAddress(a: Address): BaseAddress {
  return {
    firstName: a.firstName,
    lastName: a.lastName,
    company: a.company,
    streetName: a.streetName,
    streetNumber: a.streetNumber,
    postalCode: a.postalCode,
    city: a.city,
    region: a.region,
    state: a.state,
    country: a.country,
    phone: a.phone,
    email: a.email,
  };
}

export async function setCartAddresses(
  cartId: string,
  version: number,
  shipping: Address,
  billing: Address | undefined,
  associateId: string,
  businessUnitKey: string,
  locale?: string
): Promise<Cart> {
  const actions: CartUpdateAction[] = [
    { action: 'setShippingAddress', address: toBaseAddress(shipping) },
    { action: 'setBillingAddress', address: toBaseAddress(billing ?? shipping) },
  ];
  const { body } = await asAssociateCarts(associateId, businessUnitKey)
    .withId({ ID: cartId })
    .post({ body: { version, actions } })
    .execute();
  return mapCart(body, locale);
}

export async function setShippingMethod(
  cartId: string,
  version: number,
  shippingMethodId: string,
  associateId: string,
  businessUnitKey: string,
  locale?: string
): Promise<Cart> {
  const { body } = await asAssociateCarts(associateId, businessUnitKey)
    .withId({ ID: cartId })
    .post({
      body: {
        version,
        actions: [{ action: 'setShippingMethod', shippingMethod: { id: shippingMethodId, typeId: 'shipping-method' } }],
      },
    })
    .execute();
  return mapCart(body, locale);
}
