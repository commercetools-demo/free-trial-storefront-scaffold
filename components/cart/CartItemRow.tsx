'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { CartLineItem } from '@/lib/types';
import { formatMoney } from '@/lib/utils';
import { useCartMutations } from '@/hooks/useCart';

export function CartItemRow({ item, locale }: { item: CartLineItem; locale: string }) {
  const { updateItem, removeItem } = useCartMutations();
  const [busy, setBusy] = useState(false);

  async function setQty(qty: number) {
    if (qty < 1) return;
    setBusy(true);
    try {
      await updateItem(item.id, qty);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await removeItem(item.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-4 py-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded border border-border bg-white">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-2" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-charcoal-light">No image</div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-4">
          <div>
            {item.slug ? (
              <Link href={`/products/${item.slug}` as `/${string}`} className="text-sm font-medium text-charcoal hover:text-terra">
                {item.name}
              </Link>
            ) : (
              <span className="text-sm font-medium text-charcoal">{item.name}</span>
            )}
            {item.sku && <p className="text-xs text-charcoal-light">SKU: {item.sku}</p>}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-charcoal">
              {formatMoney(item.totalPrice.centAmount, item.totalPrice.currencyCode, locale)}
            </p>
            <p className="text-xs text-charcoal-light">
              {formatMoney(item.unitPrice.centAmount, item.unitPrice.currencyCode, locale)} each
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center rounded-md border border-border">
            <button
              onClick={() => setQty(item.quantity - 1)}
              disabled={busy || item.quantity <= 1}
              className="px-3 py-1 text-charcoal-light hover:text-charcoal disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => setQty(item.quantity + 1)}
              disabled={busy}
              className="px-3 py-1 text-charcoal-light hover:text-charcoal disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button onClick={remove} disabled={busy} className="text-xs text-charcoal-light hover:text-red-600">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
