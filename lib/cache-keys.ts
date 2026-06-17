export const KEY_CART = 'cart';
export const KEY_ACCOUNT = 'account';
export const KEY_ORDERS = 'orders';
export const KEY_ADDRESSES = 'addresses';
export const KEY_WISHLIST = 'wishlist';
export const KEY_SHIPPING_METHODS = 'shipping-methods';
export function keyOrder(id: string) { return `order-${id}`; }
export function keyWishlist(customerId: string | null | undefined) {
  return customerId ? ['wishlist', customerId] : null;
}
