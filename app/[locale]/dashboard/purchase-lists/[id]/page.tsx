'use client';
import { use, useState } from 'react';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/routing';
import { usePurchaseList, usePurchaseListMutations } from '@/hooks/usePurchaseLists';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, Button, Alert, Spinner, EmptyState } from '@/components/ui';

export default function PurchaseListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { purchaseList, isLoading } = usePurchaseList(id);
  const { removeItem, addAllToCart } = usePurchaseListMutations();
  const { can } = usePermissions();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const canUpdate = can('UpdateMyShoppingLists');

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-terra" />
      </div>
    );
  }
  if (!purchaseList) return <Alert tone="danger">Purchase list not found.</Alert>;

  async function handleAddAll() {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await addAllToCart(id);
      setStatus('All items added to your cart.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add items to cart');
    } finally {
      setBusy(false);
    }
  }

  const list = purchaseList;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/purchase-lists" className="text-sm text-charcoal-light hover:text-charcoal">
          ← Purchase lists
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-charcoal">{list.name}</h1>
          <div className="flex gap-2">
            <Button onClick={handleAddAll} disabled={busy || list.items.length === 0}>
              {busy ? 'Adding…' : 'Add all to cart'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/cart')}>
              View cart
            </Button>
          </div>
        </div>
        {list.description && <p className="mt-1 text-sm text-charcoal-light">{list.description}</p>}
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
      {status && <Alert tone="success">{status}</Alert>}

      {list.items.length === 0 ? (
        <EmptyState
          title="This list is empty"
          description="Add products from their detail pages using “Add to list”."
          action={
            <Link href="/products">
              <Button variant="outline">Browse products</Button>
            </Link>
          }
        />
      ) : (
        <Card className="divide-y divide-border px-4">
          {list.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-border bg-white">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-charcoal-light">No image</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal">{item.name}</p>
                {item.sku && <p className="text-xs text-charcoal-light">SKU: {item.sku}</p>}
              </div>
              <span className="text-sm text-charcoal-light">Qty {item.quantity}</span>
              {canUpdate && (
                <button
                  onClick={() => removeItem(id, item.id)}
                  className="text-xs text-charcoal-light hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
