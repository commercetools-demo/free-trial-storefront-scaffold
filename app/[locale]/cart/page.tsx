'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useCartContext } from '@/context/CartContext';
import { useLocale } from '@/context/LocaleContext';
import { formatMoney } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import QuantityStepper from '@/components/cart/QuantityStepper';
import OrderSummary from '@/components/cart/OrderSummary';

export default function CartPage() {
  const { cart, isLoading, mutateCart } = useCartContext();
  const { locale } = useLocale();

  if (isLoading && !cart) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner size={32} />
      </div>
    );
  }

  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-black">Your bag is empty</h1>
        <p className="mt-2 text-ink/50">Let’s fix that — find something that glows.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="primary" size="lg">Start shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <h1 className="mb-8 text-4xl font-black tracking-tight">Your bag</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-border">
          {cart.lineItems.map((li) => (
            <li key={li.id} className="flex gap-4 py-6">
              <Link
                href={li.sku ? `/p/${li.sku}` : '#'}
                className="relative h-32 w-24 shrink-0 overflow-hidden rounded-2xl bg-mist"
              >
                {li.image && (
                  <Image src={li.image} alt={li.name} fill sizes="96px" className="object-cover" />
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link href={li.sku ? `/p/${li.sku}` : '#'} className="font-semibold hover:text-violet">
                    {li.name}
                  </Link>
                  <span className="font-bold">{formatMoney(li.totalPrice, locale)}</span>
                </div>
                <p className="text-sm text-ink/40">{formatMoney(li.unitPrice, locale)} each</p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <QuantityStepper
                    quantity={li.quantity}
                    onChange={(q) => mutateCart.changeQuantity(li.id, q)}
                  />
                  <button
                    onClick={() => mutateCart.removeLineItem(li.id)}
                    className="text-sm text-ink/40 hover:text-magenta"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary cart={cart}>
            <Link href="/checkout" className="block">
              <Button variant="primary" size="lg" className="w-full">
                Checkout
              </Button>
            </Link>
            <Link href="/" className="mt-2 block">
              <Button variant="ghost" size="md" className="w-full">
                Continue shopping
              </Button>
            </Link>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
