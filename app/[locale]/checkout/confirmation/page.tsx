import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getOrderById, getOrderByNumber } from '@/lib/ct/orders';
import { mapOrder } from '@/lib/mappers/cart';
import type { OrderSummary } from '@/lib/types';
import { Money } from '@/components/ui/Price';

export const metadata = { title: 'Order Confirmation' };

type Props = { searchParams: Promise<{ orderId?: string; orderNumber?: string }> };

export default async function ConfirmationPage({ searchParams }: Props) {
  const { orderId, orderNumber } = await searchParams;
  const t = await getTranslations('checkout');
  const tc = await getTranslations('common');
  const { locale } = await getLocale();

  let order: OrderSummary | null = null;
  try {
    if (orderId) order = mapOrder(await getOrderById(orderId), locale);
    else if (orderNumber) order = mapOrder(await getOrderByNumber(orderNumber), locale);
  } catch {
    order = null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-sage">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="text-3xl font-semibold text-charcoal">{t('thankYou')}</h1>
      <p className="mt-3 text-charcoal-light">
        {order?.orderNumber
          ? t('placedNumbered', { orderNumber: order.orderNumber })
          : order
            ? t('placed')
            : t('placedEmail')}
      </p>

      {order && (
        <div className="mt-10 rounded-sm border border-border bg-cream-dark p-6 text-left">
          <h2 className="mb-4 text-lg font-medium text-charcoal">{t('confirmationSummary')}</h2>
          <ul className="divide-y divide-border">
            {order.lineItems.map((li) => (
              <li key={li.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-charcoal">{li.name} × {li.quantity}</span>
                <span className="text-charcoal">
                  <Money centAmount={li.totalPrice.centAmount} currencyCode={li.totalPrice.currencyCode} />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-medium">
            <span className="text-charcoal">{t('total')}</span>
            <span className="text-charcoal">
              <Money centAmount={order.totalPrice.centAmount} currencyCode={order.totalPrice.currencyCode} />
            </span>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-center gap-3">
        <Link href="/" className="rounded-sm bg-charcoal px-6 py-3 text-sm font-medium text-cream hover:bg-charcoal-light">
          {tc('continueShopping')}
        </Link>
        <Link href="/account/orders" className="rounded-sm border border-charcoal px-6 py-3 text-sm font-medium text-charcoal hover:bg-charcoal hover:text-cream">
          {t('viewOrders')}
        </Link>
      </div>
    </div>
  );
}
