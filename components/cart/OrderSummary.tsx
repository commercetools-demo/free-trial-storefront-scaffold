'use client';

import { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useCartContext } from '@/context/CartContext';
import { formatMoney } from '@/lib/utils';
import Button from '@/components/ui/Button';
import type { Cart } from '@/lib/types';

export default function OrderSummary({
  cart,
  showDiscount = true,
  children,
}: {
  cart: Cart;
  showDiscount?: boolean;
  children?: React.ReactNode;
}) {
  const { locale } = useLocale();
  const { mutateCart } = useCartContext();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function applyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError('');
    const res = await mutateCart.applyDiscount(code.trim());
    if (res.error) setError(res.error);
    else setCode('');
    setBusy(false);
  }

  const shipping = cart.shippingInfo?.price;

  return (
    <div className="rounded-3xl border border-border bg-mist/40 p-6">
      <h2 className="text-lg font-bold">Order summary</h2>

      {showDiscount && (
        <form onSubmit={applyCode} className="mt-4">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Discount code"
              className="w-full rounded-full border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet/40"
            />
            <Button variant="secondary" size="sm" type="submit" isLoading={busy}>
              Apply
            </Button>
          </div>
          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </form>
      )}

      {cart.discountCodes.length > 0 && (
        <ul className="mt-3 space-y-1">
          {cart.discountCodes.map((dc) => (
            <li key={dc.id} className="flex items-center justify-between text-sm">
              <span className="font-medium text-sage">{dc.name ?? dc.code}</span>
              <button
                onClick={() => mutateCart.removeDiscount(dc.id)}
                className="text-xs text-ink/40 hover:text-magenta"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink/60">Subtotal</dt>
          <dd className="font-medium">{formatMoney(cart.subtotal, locale)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/60">Shipping</dt>
          <dd className="font-medium">
            {shipping ? formatMoney(shipping, locale) : 'Calculated at checkout'}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base">
          <dt className="font-bold">Total</dt>
          <dd className="font-black">{formatMoney(cart.totalPrice, locale)}</dd>
        </div>
      </dl>

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
