'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useCartContext } from '@/context/CartProvider';
import { Money, PriceDisplay } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Spinner } from '@/components/ui/Spinner';

export function CartView() {
  const t = useTranslations('cart');
  const tc = useTranslations('common');
  const { cart, isLoading, mutateCart } = useCartContext();
  const [code, setCode] = useState('');
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [busyLine, setBusyLine] = useState<string | null>(null);

  if (isLoading && !cart) {
    return (
      <div className="flex justify-center py-32 text-charcoal-light">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <h1 className="text-2xl font-semibold text-charcoal">{t('empty')}</h1>
        <p className="text-charcoal-light">{t('emptyHint')}</p>
        <Link href="/">
          <Button>{tc('continueShopping')}</Button>
        </Link>
      </div>
    );
  }

  async function changeQty(lineItemId: string, qty: number) {
    setBusyLine(lineItemId);
    try {
      await mutateCart.changeQuantity(lineItemId, qty);
    } finally {
      setBusyLine(null);
    }
  }

  async function applyDiscount(e: React.FormEvent) {
    e.preventDefault();
    setDiscountError(null);
    try {
      await mutateCart.applyDiscount(code.trim());
      setCode('');
    } catch (err) {
      setDiscountError(err instanceof Error ? err.message : t('invalidCode'));
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <ul className="divide-y divide-border border-y border-border">
          {cart.lineItems.map((li) => (
            <li key={li.id} className="flex gap-4 py-5">
              <Link href={li.slug ? `/product/${li.sku}` : '#'} className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-cream-dark">
                {li.image && <Image src={li.image} alt={li.name} fill sizes="96px" className="object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link href={li.sku ? `/product/${li.sku}` : '#'} className="text-sm font-medium text-charcoal hover:text-terra">
                    {li.name}
                  </Link>
                  <PriceDisplay price={li.unitPrice} className="text-sm" />
                </div>
                {li.sku && <p className="mt-1 text-xs text-charcoal-light">{t('sku', { sku: li.sku })}</p>}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <QuantityStepper
                    value={li.quantity}
                    onChange={(q) => changeQty(li.id, q)}
                    disabled={busyLine === li.id}
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-charcoal">
                      <Money centAmount={li.totalPrice.centAmount} currencyCode={li.totalPrice.currencyCode} />
                    </span>
                    <button
                      onClick={() => mutateCart.removeLineItem(li.id)}
                      className="text-xs text-charcoal-light hover:text-terra"
                    >
                      {tc('remove')}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-sm border border-border bg-cream-dark p-6">
          <h2 className="mb-4 text-lg font-medium text-charcoal">{t('orderSummary')}</h2>

          <form onSubmit={applyDiscount} className="mb-4">
            <label className="mb-1 block text-xs text-charcoal-light">{t('discountCode')}</label>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('enterCode')}
                className="flex-1 border border-border bg-cream px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-charcoal"
              />
              <Button type="submit" variant="secondary" disabled={!code.trim()}>{t('apply')}</Button>
            </div>
            {discountError && <p className="mt-1 text-xs text-terra">{discountError}</p>}
          </form>

          {cart.discountCodes.length > 0 && (
            <ul className="mb-4 space-y-1">
              {cart.discountCodes.map((d) => (
                <li key={d.id} className="flex items-center justify-between text-sm text-charcoal">
                  <span>{t('code', { code: d.code || d.id.slice(0, 8) })}</span>
                  <button onClick={() => mutateCart.removeDiscount(d.id)} className="text-xs text-terra hover:underline">
                    {tc('remove')}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-charcoal-light">{t('subtotal')}</dt>
              <dd className="text-charcoal">
                <Money centAmount={cart.subtotal.centAmount} currencyCode={cart.subtotal.currencyCode} />
              </dd>
            </div>
            {cart.shippingInfo && (
              <div className="flex justify-between">
                <dt className="text-charcoal-light">{t('shipping', { method: cart.shippingInfo.methodName })}</dt>
                <dd className="text-charcoal">
                  <Money centAmount={cart.shippingInfo.price.centAmount} currencyCode={cart.shippingInfo.price.currencyCode} />
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
              <dt className="text-charcoal">{t('total')}</dt>
              <dd className="text-charcoal">
                <Money centAmount={cart.totalPrice.centAmount} currencyCode={cart.totalPrice.currencyCode} />
              </dd>
            </div>
          </dl>

          <Link href="/checkout" className="mt-6 block">
            <Button className="w-full">{t('checkout')}</Button>
          </Link>
        </div>
      </aside>
    </div>
  );
}
