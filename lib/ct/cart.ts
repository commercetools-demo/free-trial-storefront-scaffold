import 'server-only';
import type {
  Cart as CtCart,
  CartUpdateAction,
  BaseAddress,
} from '@commercetools/platform-sdk';
import { apiRoot } from './client';

const CART_EXPAND = ['discountCodes[*].discountCode'];

export async function getCart(cartId: string): Promise<CtCart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .get({ queryArgs: { expand: CART_EXPAND } })
    .execute();
  return body;
}

export async function createCart(
  currency: string,
  country: string,
  customerId?: string,
): Promise<CtCart> {
  const { body } = await apiRoot
    .carts()
    .post({
      body: {
        currency,
        country,
        shippingMode: 'Single',
        deleteDaysAfterLastModification: 30,
        ...(customerId ? { customerId } : {}),
      },
    })
    .execute();
  return body;
}

async function update(cartId: string, version: number, actions: CartUpdateAction[]): Promise<CtCart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({ body: { version, actions }, queryArgs: { expand: CART_EXPAND } })
    .execute();
  return body;
}

export function addLineItem(
  cartId: string,
  version: number,
  productId: string,
  variantId: number,
  quantity = 1,
) {
  return update(cartId, version, [{ action: 'addLineItem', productId, variantId, quantity }]);
}

export function addLineItemBySku(cartId: string, version: number, sku: string, quantity = 1) {
  return update(cartId, version, [{ action: 'addLineItem', sku, quantity }]);
}

export function removeLineItem(cartId: string, version: number, lineItemId: string) {
  return update(cartId, version, [{ action: 'removeLineItem', lineItemId }]);
}

export function changeLineItemQuantity(
  cartId: string,
  version: number,
  lineItemId: string,
  quantity: number,
) {
  return update(cartId, version, [{ action: 'changeLineItemQuantity', lineItemId, quantity }]);
}

export function setShippingAddress(cartId: string, version: number, address: BaseAddress) {
  return update(cartId, version, [{ action: 'setShippingAddress', address }]);
}

export function setBillingAddress(cartId: string, version: number, address: BaseAddress) {
  return update(cartId, version, [{ action: 'setBillingAddress', address }]);
}

export function setShippingMethod(cartId: string, version: number, shippingMethodId: string) {
  return update(cartId, version, [
    { action: 'setShippingMethod', shippingMethod: { typeId: 'shipping-method', id: shippingMethodId } },
  ]);
}

export function addDiscountCode(cartId: string, version: number, code: string) {
  return update(cartId, version, [{ action: 'addDiscountCode', code }]);
}

export function removeDiscountCode(cartId: string, version: number, discountCodeId: string) {
  return update(cartId, version, [
    { action: 'removeDiscountCode', discountCode: { typeId: 'discount-code', id: discountCodeId } },
  ]);
}

export function setCustomerEmail(cartId: string, version: number, email: string) {
  return update(cartId, version, [{ action: 'setCustomerEmail', email }]);
}
