import 'server-only';
import type { Cart as CtCart, MyCartUpdateAction, BaseAddress } from '@commercetools/platform-sdk';
import { apiRoot } from './client';

export async function getCart(cartId: string): Promise<CtCart> {
  const { body } = await apiRoot.carts().withId({ ID: cartId }).get().execute();
  return body;
}

export async function createCart(
  currency: string,
  country: string,
  customerId?: string,
  customerEmail?: string
): Promise<CtCart> {
  const { body } = await apiRoot
    .carts()
    .post({
      body: {
        currency,
        country,
        shippingMode: 'Single',
        ...(customerId ? { customerId } : { anonymousId: undefined }),
        ...(customerEmail ? { customerEmail } : {}),
      },
    })
    .execute();
  return body;
}

async function update(cartId: string, version: number, actions: MyCartUpdateAction[]): Promise<CtCart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({ body: { version, actions: actions as never } })
    .execute();
  return body;
}

/** Re-fetch the current version then apply actions; retry once on a 409 conflict. */
async function safeUpdate(cartId: string, actions: MyCartUpdateAction[]): Promise<CtCart> {
  let cart = await getCart(cartId);
  try {
    return await update(cartId, cart.version, actions);
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'statusCode' in e && (e as { statusCode?: number }).statusCode === 409) {
      cart = await getCart(cartId);
      return update(cartId, cart.version, actions);
    }
    throw e;
  }
}

export function addLineItem(cartId: string, productId: string, variantId: number, quantity = 1) {
  return safeUpdate(cartId, [{ action: 'addLineItem', productId, variantId, quantity }]);
}

export function removeLineItem(cartId: string, lineItemId: string) {
  return safeUpdate(cartId, [{ action: 'removeLineItem', lineItemId }]);
}

export function changeLineItemQuantity(cartId: string, lineItemId: string, quantity: number) {
  return safeUpdate(cartId, [{ action: 'changeLineItemQuantity', lineItemId, quantity }]);
}

export function setShippingAddress(cartId: string, address: BaseAddress) {
  return safeUpdate(cartId, [{ action: 'setShippingAddress', address }]);
}

export function setBillingAddress(cartId: string, address: BaseAddress) {
  return safeUpdate(cartId, [{ action: 'setBillingAddress', address }]);
}

export function setShippingMethod(cartId: string, shippingMethodId: string) {
  return safeUpdate(cartId, [
    { action: 'setShippingMethod', shippingMethod: { typeId: 'shipping-method', id: shippingMethodId } },
  ]);
}

export function addDiscountCode(cartId: string, code: string) {
  return safeUpdate(cartId, [{ action: 'addDiscountCode', code }]);
}

export function removeDiscountCode(cartId: string, discountCodeId: string) {
  return safeUpdate(cartId, [
    { action: 'removeDiscountCode', discountCode: { typeId: 'discount-code', id: discountCodeId } },
  ]);
}

export function setCustomerEmail(cartId: string, email: string) {
  return safeUpdate(cartId, [{ action: 'setCustomerEmail', email }]);
}
