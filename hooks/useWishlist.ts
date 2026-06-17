'use client';
import useSWR, { useSWRConfig } from 'swr';
import { keyWishlist } from '@/lib/cache-keys';
import { useAccount } from './useAccount';
import type { Wishlist } from '@/lib/types';

async function fetchWishlists(): Promise<Wishlist[]> {
  const res = await fetch('/api/wishlist');
  if (!res.ok) return [];
  return (await res.json()).wishlists ?? [];
}

export function useWishlist() {
  const { user } = useAccount();
  const customerId = user?.id;
  const key = keyWishlist(customerId);
  const { data, isLoading } = useSWR<Wishlist[]>(key, fetchWishlists, { revalidateOnFocus: false });
  const { mutate } = useSWRConfig();
  const wishlists = data ?? [];

  const refresh = () => mutate(key);

  const totalItems = wishlists.reduce((sum, w) => sum + w.lineItems.length, 0);

  /** Is this product (by productId, or variantId) saved in any wishlist? */
  function isSaved(productId: string, variantId?: number): boolean {
    return wishlists.some((w) =>
      w.lineItems.some(
        (li) => li.productId === productId && (variantId == null || li.variantId === variantId)
      )
    );
  }

  async function ensureDefaultList(): Promise<Wishlist> {
    if (wishlists.length > 0) return wishlists[0];
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Wishlist' }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create wishlist');
    return json.wishlist;
  }

  async function toggle(productId: string, variantId: number) {
    if (!customerId) throw new Error('Not logged in');
    if (isSaved(productId, variantId)) {
      // remove from every list it appears in
      for (const w of wishlists) {
        const item = w.lineItems.find((li) => li.productId === productId && li.variantId === variantId);
        if (item) {
          await fetch(`/api/wishlist/${w.id}/items`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lineItemId: item.lineItemId }),
          });
        }
      }
    } else {
      const list = await ensureDefaultList();
      await fetch(`/api/wishlist/${list.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity: 1 }),
      });
    }
    await refresh();
  }

  async function removeItem(wishlistId: string, lineItemId: string) {
    await fetch(`/api/wishlist/${wishlistId}/items`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineItemId }),
    });
    await refresh();
  }

  async function createList(name: string) {
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    await refresh();
  }

  async function deleteList(wishlistId: string) {
    await fetch(`/api/wishlist/${wishlistId}`, { method: 'DELETE' });
    await refresh();
  }

  return {
    wishlists,
    isLoading,
    totalItems,
    isLoggedIn: !!customerId,
    isSaved,
    toggle,
    removeItem,
    createList,
    deleteList,
    refresh,
  };
}
