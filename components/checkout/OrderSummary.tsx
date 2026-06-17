'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCartContext } from '@/context/CartProvider';
import { Money } from '@/components/ui/Price';

export function OrderSummary() {
  const t = useTranslations('checkout');
  const { cart } = useCartContext();
  if (!cart) return null;

  return (
    <div className="rounded-sm border border-border bg-cream-dark p-6">
      <h2 className="mb-4 text-lg font-medium text-charcoal">{t('orderSummary')}</h2>
      <ul className="mb-4 max-h-72 space-y-3 overflow-y-auto">
        {cart.lineItems.map((li) => (
          <li key={li.id} className="flex gap-3">
            <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-cream">
              {li.image && <Image src={li.image} alt={li.name} fill sizes="56px" className="object-cover" />}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm text-charcoal line-clamp-2">{li.name}</span>
              <span className="text-xs text-charcoal-light">{t('qty', { n: li.quantity })}</span>
            </div>
            <span className="text-sm text-charcoal">
              <Money centAmount={li.totalPrice.centAmount} currencyCode={li.totalPrice.currencyCode} />
            </span>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-charcoal-light">{t('subtotal')}</dt>
          <dd className="text-charcoal">
            <Money centAmount={cart.subtotal.centAmount} currencyCode={cart.subtotal.currencyCode} />
          </dd>
        </div>
        {cart.shippingInfo && (
          <div className="flex justify-between">
            <dt className="text-charcoal-light">{t('shipping')}</dt>
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
    </div>
  );
}
