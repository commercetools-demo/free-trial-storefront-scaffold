import type { Cart } from '@/lib/types';
import { formatMoney } from '@/lib/utils';
import { Card } from '@/components/ui';

export function OrderSummary({ cart, locale }: { cart: Cart; locale: string }) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-charcoal">Order summary</h2>
      <ul className="mt-4 space-y-3">
        {cart.lineItems.map((li) => (
          <li key={li.id} className="flex justify-between gap-2 text-sm">
            <span className="text-charcoal-light">
              {li.name} <span className="text-xs">× {li.quantity}</span>
            </span>
            <span className="text-charcoal">
              {formatMoney(li.totalPrice.centAmount, li.totalPrice.currencyCode, locale)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        {cart.shippingInfo?.price && (
          <div className="flex justify-between">
            <dt className="text-charcoal-light">
              Shipping{cart.shippingInfo.shippingMethodName ? ` (${cart.shippingInfo.shippingMethodName})` : ''}
            </dt>
            <dd className="text-charcoal">
              {formatMoney(cart.shippingInfo.price.centAmount, cart.shippingInfo.price.currencyCode, locale)}
            </dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatMoney(cart.totalPrice.centAmount, cart.totalPrice.currencyCode, locale)}</dd>
        </div>
      </dl>
    </Card>
  );
}
