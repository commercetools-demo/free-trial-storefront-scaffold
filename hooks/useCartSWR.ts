'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_CART } from '@/lib/cache-keys';
import type { Cart } from '@/lib/types';

async function cartFetcher(): Promise<Cart | null> {
  const res = await fetch('/api/cart');
  if (!res.ok) return null;
  const data = await res.json();
  return data.cart ?? null;
}

export function useCartSWR(fallback?: Cart | null) {
  return useSWR<Cart | null>(KEY_CART, cartFetcher, {
    fallbackData: fallback ?? undefined,
    revalidateOnFocus: true,
  });
}

interface CartResult {
  cart?: Cart | null;
  error?: string;
}

export function useCartMutations() {
  const { mutate } = useSWRConfig();

  const commit = (cart: Cart | null) => mutate(KEY_CART, cart, { revalidate: false });

  async function post(url: string, body?: unknown, method = 'POST'): Promise<CartResult> {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = (await res.json()) as CartResult;
    if (res.ok && data.cart !== undefined) commit(data.cart);
    if (!res.ok) return { error: data.error ?? 'Something went wrong' };
    return data;
  }

  return {
    addItem: (productId: string, variantId: number, quantity = 1) =>
      post('/api/cart/items', { productId, variantId, quantity }),
    addItemBySku: (sku: string, quantity = 1) => post('/api/cart/items', { sku, quantity }),
    removeLineItem: (lineItemId: string) =>
      post('/api/cart/items', { lineItemId }, 'DELETE'),
    changeQuantity: (lineItemId: string, quantity: number) =>
      post('/api/cart/items', { lineItemId, quantity }, 'PATCH'),
    setShippingMethod: (shippingMethodId: string) =>
      post('/api/cart', { shippingMethodId }, 'PATCH'),
    setAddresses: (shippingAddress: unknown, billingAddress: unknown, email?: string) =>
      post('/api/cart', { shippingAddress, billingAddress, ...(email ? { email } : {}) }, 'PATCH'),
    applyDiscount: (code: string) => post('/api/cart/discount', { code }),
    removeDiscount: (discountCodeId: string) =>
      post('/api/cart/discount', { discountCodeId }, 'DELETE'),
    refresh: () => mutate(KEY_CART),
  };
}
