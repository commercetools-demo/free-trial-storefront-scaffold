'use client';
import { useState } from 'react';
import { Button } from '@/components/ui';
import type { PurchaseList } from '@/lib/types';

export function AddToPurchaseListButton({
  productId,
  variantId,
  disabled,
}: {
  productId: string;
  variantId: number;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<PurchaseList[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setMsg(null);
    if (lists === null) {
      const res = await fetch('/api/purchase-lists');
      setLists(res.ok ? ((await res.json()).purchaseLists ?? []) : []);
    }
  }

  async function addTo(listId: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/purchase-lists/${listId}/items`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity: 1 }),
      });
      if (!res.ok) throw new Error('Failed');
      setMsg('Added to list');
      setOpen(false);
    } catch {
      setMsg('Could not add to list');
    } finally {
      setBusy(false);
    }
  }

  async function createAndAdd() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/purchase-lists', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'My purchase list' }),
      });
      if (!res.ok) throw new Error('Failed');
      const { purchaseList } = await res.json();
      await addTo(purchaseList.id);
    } catch {
      setMsg('Could not create list');
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <Button variant="outline" size="lg" onClick={toggle} disabled={disabled}>
        Add to list
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-border bg-white p-2 shadow-md">
          {lists === null ? (
            <p className="px-2 py-1 text-sm text-charcoal-light">Loading…</p>
          ) : lists.length === 0 ? (
            <button
              onClick={createAndAdd}
              disabled={busy}
              className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-cream-dark"
            >
              + Create a list & add
            </button>
          ) : (
            <ul className="max-h-60 overflow-auto">
              {lists.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => addTo(l.id)}
                    disabled={busy}
                    className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-cream-dark"
                  >
                    {l.name}
                  </button>
                </li>
              ))}
              <li className="mt-1 border-t border-border pt-1">
                <button
                  onClick={createAndAdd}
                  disabled={busy}
                  className="w-full rounded px-2 py-1.5 text-left text-sm text-terra hover:bg-cream-dark"
                >
                  + New list
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
      {msg && <p className="mt-1 text-xs text-charcoal-light">{msg}</p>}
    </div>
  );
}
