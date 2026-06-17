'use client';
import { useTranslations } from 'next-intl';
import { useOrders } from '@/hooks/useOrders';
import { Money } from '@/components/ui/Price';
import { Spinner } from '@/components/ui/Spinner';

export default function OrdersPage() {
  const t = useTranslations('account');
  const { orders, isLoading } = useOrders();

  if (isLoading) {
    return <div className="flex py-12"><Spinner className="h-6 w-6 text-charcoal" /></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-sm border border-border p-8 text-center text-charcoal-light">
        {t('noOrders')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-charcoal">{t('orderHistory')}</h2>
      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="rounded-sm border border-border p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-charcoal">
                  {t('order', { id: o.orderNumber ?? o.id.slice(0, 8) })}
                </p>
                <p className="text-xs text-charcoal-light">
                  {t('orderMeta', { date: new Date(o.createdAt).toLocaleDateString(), state: o.state })}
                </p>
              </div>
              <span className="text-sm font-medium text-charcoal">
                <Money centAmount={o.totalPrice.centAmount} currencyCode={o.totalPrice.currencyCode} />
              </span>
            </div>
            <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm text-charcoal-light">
              {o.lineItems.slice(0, 4).map((li) => (
                <li key={li.id}>{li.name} × {li.quantity}</li>
              ))}
              {o.lineItems.length > 4 && <li>{t('moreItems', { n: o.lineItems.length - 4 })}</li>}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
