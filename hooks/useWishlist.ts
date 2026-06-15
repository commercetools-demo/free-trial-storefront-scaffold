'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_WISHLISTS } from '@/lib/cache-keys';
import { useAccount } from './useAccount';
import type { Wishlist } from '@/lib/types';

async function wishlistFetcher(): Promise<Wishlist[]> {
  const res = await fetch('/api/wishlists');
  if (!res.ok) return [];
  const data = await res.json();
  return data.wishlists ?? [];
}

export function useWishlist() {
  const { user } = useAccount();
  const customerId = user?.id ?? null;
  const { mutate } = useSWRConfig();
  const key = customerId ? [KEY_WISHLISTS, customerId] : null;

  const { data: wishlists, isLoading } = useSWR<Wishlist[]>(key, wishlistFetcher, {
    revalidateOnFocus: false,
  });

  const refresh = () => key && mutate(key);

  const totalItems = (wishlists ?? []).reduce((sum, w) => sum + w.lineItems.length, 0);

  function isSaved(productId: string): boolean {
    return (wishlists ?? []).some((w) => w.lineItems.some((li) => li.productId === productId));
  }

  /** Toggle a product in the default wishlist (creates one on first use). */
  async function toggle(productId: string, variantId: number): Promise<void> {
    if (!customerId) return;
    const lists = wishlists ?? [];
    const containing = lists.filter((w) => w.lineItems.some((li) => li.productId === productId));

    if (containing.length > 0) {
      // remove from every list it appears in
      await Promise.all(
        containing.map((w) => {
          const item = w.lineItems.find((li) => li.productId === productId)!;
          return fetch(`/api/wishlists/${w.id}/items`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lineItemId: item.lineItemId }),
          });
        }),
      );
    } else {
      let listId = lists[0]?.id;
      if (!listId) {
        const res = await fetch('/api/wishlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'My Wishlist' }),
        });
        const data = await res.json();
        listId = data.wishlist?.id;
      }
      if (listId) {
        await fetch(`/api/wishlists/${listId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, variantId }),
        });
      }
    }
    refresh();
  }

  async function removeItem(listId: string, lineItemId: string) {
    await fetch(`/api/wishlists/${listId}/items`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineItemId }),
    });
    refresh();
  }

  return { wishlists, isLoading, totalItems, isSaved, toggle, removeItem, refresh, customerId };
}
