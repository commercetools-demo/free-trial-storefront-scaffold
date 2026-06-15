'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useCartContext } from '@/context/CartContext';
import { useLocale } from '@/context/LocaleContext';
import { formatMoney } from '@/lib/utils';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';

export default function MiniCart() {
  const { cart, showMiniCart, closeMiniCart, mutateCart } = useCartContext();
  const { locale } = useLocale();

  const items = cart?.lineItems ?? [];
  const isEmpty = items.length === 0;

  return (
    <Drawer
      isOpen={showMiniCart}
      onClose={closeMiniCart}
      title={`Your bag (${cart?.totalLineItemQuantity ?? 0})`}
      position="right"
      footer={
        !isEmpty ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Subtotal</span>
              <span className="font-bold">{formatMoney(cart?.totalPrice, locale)}</span>
            </div>
            <Link href="/checkout" onClick={closeMiniCart} className="block">
              <Button variant="primary" size="lg" className="w-full">
                Checkout
              </Button>
            </Link>
            <Link href="/cart" onClick={closeMiniCart} className="block">
              <Button variant="ghost" size="md" className="w-full">
                View full bag
              </Button>
            </Link>
          </div>
        ) : undefined
      }
    >
      {isEmpty ? (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold">Your bag is empty</p>
          <p className="mt-1 text-sm text-ink/50">Time to find something that glows.</p>
          <Link href="/" onClick={closeMiniCart} className="mt-4 inline-block">
            <Button variant="outline" size="md">
              Start shopping
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((li) => (
            <li key={li.id} className="flex gap-3">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-mist">
                {li.image && (
                  <Image src={li.image} alt={li.name} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="line-clamp-2 text-sm font-semibold">{li.name}</p>
                <p className="text-xs text-ink/50">Qty {li.quantity}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold">{formatMoney(li.totalPrice, locale)}</span>
                  <button
                    onClick={() => mutateCart.removeLineItem(li.id)}
                    className="text-xs text-ink/40 hover:text-magenta"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
