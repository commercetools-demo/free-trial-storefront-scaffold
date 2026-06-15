export const KEY_CART = 'cart';
export const KEY_ACCOUNT = 'account';
export const KEY_ORDERS = 'orders';
export const KEY_ADDRESSES = 'addresses';
export const KEY_WISHLISTS = 'wishlists';

export function keyOrder(id: string) {
  return `order-${id}`;
}

export function keyShippingMethods(country: string, currency: string) {
  return `shipping-methods-${country}-${currency}`;
}
