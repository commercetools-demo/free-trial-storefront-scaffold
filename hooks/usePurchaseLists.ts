'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_PURCHASE_LISTS, keyPurchaseList } from '@/lib/cache-keys';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import type { PurchaseList } from '@/lib/types';

export function usePurchaseLists() {
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;
  const { data, isLoading } = useSWR<PurchaseList[]>(
    buKey ? [KEY_PURCHASE_LISTS, buKey] : null,
    async () => {
      const res = await fetch('/api/purchase-lists');
      return res.ok ? ((await res.json()).purchaseLists ?? []) : [];
    },
    { revalidateOnFocus: false }
  );
  return { purchaseLists: data ?? [], isLoading };
}

export function usePurchaseList(id: string | null) {
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;
  const { data, isLoading, mutate } = useSWR<PurchaseList | null>(
    id && buKey ? [keyPurchaseList(id), buKey] : null,
    async () => {
      const res = await fetch(`/api/purchase-lists/${id}`);
      return res.ok ? (await res.json()).purchaseList : null;
    },
    { revalidateOnFocus: false }
  );
  return { purchaseList: data ?? null, isLoading, mutate };
}

export function usePurchaseListMutations() {
  const { mutate } = useSWRConfig();
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;

  function refreshLists() {
    if (buKey) mutate([KEY_PURCHASE_LISTS, buKey]);
  }

  async function createList(name: string, description?: string) {
    const res = await fetch('/api/purchase-lists', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to create list');
    refreshLists();
    return (await res.json()).purchaseList as PurchaseList;
  }

  async function deleteList(id: string) {
    const res = await fetch(`/api/purchase-lists/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to delete list');
    refreshLists();
  }

  async function removeItem(id: string, lineItemId: string) {
    const res = await fetch(`/api/purchase-lists/${id}/items`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lineItemId }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to remove item');
    const { purchaseList } = await res.json();
    if (buKey) mutate([keyPurchaseList(id), buKey], purchaseList, { revalidate: false });
    refreshLists();
  }

  async function addAllToCart(id: string) {
    const res = await fetch(`/api/purchase-lists/${id}/add-to-cart`, { method: 'POST' });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to add to cart');
    const { cart } = await res.json();
    mutate('cart', cart, { revalidate: false });
  }

  return { createList, deleteList, removeItem, addAllToCart };
}
