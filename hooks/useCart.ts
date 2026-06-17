'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_CART } from '@/lib/cache-keys';
import type { Cart } from '@/lib/types';

export function useCartSWR() {
  return useSWR<Cart | null>(
    KEY_CART,
    async () => {
      const res = await fetch('/api/cart');
      return res.ok ? ((await res.json()).cart ?? null) : null;
    },
    { revalidateOnFocus: true }
  );
}

export function useCartMutations() {
  const { mutate } = useSWRConfig();

  function apply(cart: Cart | null) {
    return mutate(KEY_CART, cart, { revalidate: false });
  }

  async function addItem(productId: string, variantId: number, quantity = 1) {
    const res = await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId, variantId, quantity }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to add item');
    await apply((await res.json()).cart);
  }

  async function updateItem(lineItemId: string, quantity: number) {
    const res = await fetch('/api/cart/items', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lineItemId, quantity }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to update item');
    await apply((await res.json()).cart);
  }

  async function removeItem(lineItemId: string) {
    const res = await fetch('/api/cart/items', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lineItemId }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to remove item');
    await apply((await res.json()).cart);
  }

  return { addItem, updateItem, removeItem, apply };
}
