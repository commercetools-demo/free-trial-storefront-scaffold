'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_CART } from '@/lib/cache-keys';
import type { Cart } from '@/lib/types';

async function fetchCart(): Promise<Cart | null> {
  const res = await fetch('/api/cart');
  if (!res.ok) return null;
  return (await res.json()).cart ?? null;
}

export function useCartSWR(initialCart?: Cart | null) {
  return useSWR<Cart | null>(KEY_CART, fetchCart, {
    revalidateOnFocus: true,
    fallbackData: initialCart ?? undefined,
  });
}

async function send(url: string, method: string, body?: unknown): Promise<Cart> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Cart operation failed');
  return json.cart;
}

export function useCartMutations() {
  const { mutate } = useSWRConfig();
  const set = (cart: Cart) => mutate(KEY_CART, cart, { revalidate: false });

  return {
    async addItem(productId: string, variantId: number, quantity = 1) {
      set(await send('/api/cart/line-items', 'POST', { productId, variantId, quantity }));
    },
    async changeQuantity(lineItemId: string, quantity: number) {
      set(await send('/api/cart/line-items', 'PATCH', { lineItemId, quantity }));
    },
    async removeLineItem(lineItemId: string) {
      set(await send('/api/cart/line-items', 'DELETE', { lineItemId }));
    },
    async applyDiscount(code: string) {
      set(await send('/api/cart/discount', 'POST', { code }));
    },
    async removeDiscount(discountCodeId: string) {
      set(await send('/api/cart/discount', 'DELETE', { discountCodeId }));
    },
    async setAddresses(shippingAddress: unknown, billingAddress: unknown) {
      const cart = await send('/api/cart/address', 'PATCH', { shippingAddress, billingAddress });
      set(cart);
      return cart;
    },
    async setShippingMethod(shippingMethodId: string) {
      set(await send('/api/cart/shipping-method', 'PATCH', { shippingMethodId }));
    },
  };
}
