'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useCartContext } from '@/context/CartProvider';
import { Money } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';

export function MiniCart() {
  const t = useTranslations('miniCart');
  const tc = useTranslations('common');
  const { cart, showMiniCart, closeMiniCart, mutateCart } = useCartContext();
  if (!showMiniCart) return null;

  const items = cart?.lineItems ?? [];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-charcoal/30" onClick={closeMiniCart} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-medium text-charcoal">
            {cart ? t('titleCount', { count: cart.totalLineItemQuantity }) : t('title')}
          </h2>
          <button onClick={closeMiniCart} aria-label={t('close')} className="text-charcoal-light hover:text-charcoal">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-charcoal-light">
            <p>{t('empty')}</p>
            <Link href="/" onClick={closeMiniCart} className="text-terra hover:underline">
              {tc('continueShopping')}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {items.map((li) => (
                <li key={li.id} className="flex gap-3 py-4">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-cream-dark">
                    {li.image && <Image src={li.image} alt={li.name} fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm text-charcoal line-clamp-2">{li.name}</span>
                    <span className="text-xs text-charcoal-light">{t('qty', { n: li.quantity })}</span>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm text-charcoal">
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
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-charcoal-light">{t('subtotal')}</span>
                {cart && (
                  <span className="font-medium text-charcoal">
                    <Money centAmount={cart.subtotal.centAmount} currencyCode={cart.subtotal.currencyCode} />
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/cart" onClick={closeMiniCart}>
                  <Button variant="secondary" className="w-full">{t('viewCart')}</Button>
                </Link>
                <Link href="/checkout" onClick={closeMiniCart}>
                  <Button className="w-full">{t('checkout')}</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
