'use client';

import Image from 'next/image';
import { useOrders } from '@/hooks/useOrders';
import { useLocale } from '@/context/LocaleContext';
import { formatMoney } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const { locale } = useLocale();

  if (isLoading) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner size={28} />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="font-semibold">No orders yet</p>
        <p className="mt-1 text-sm text-ink/50">When you place an order it’ll show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <p className="font-bold">Order #{order.orderNumber ?? order.id.slice(0, 8)}</p>
              <p className="text-xs text-ink/50">
                {new Date(order.createdAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {order.orderState && <Badge variant="info">{order.orderState}</Badge>}
              <span className="font-black">{formatMoney(order.totalPrice, locale)}</span>
            </div>
          </div>
          <ul className="mt-3 flex flex-wrap gap-3">
            {order.lineItems.map((li) => (
              <li key={li.id} className="flex items-center gap-2">
                <div className="relative h-12 w-10 overflow-hidden rounded-lg bg-mist">
                  {li.image && (
                    <Image src={li.image} alt={li.name} fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <span className="text-xs text-ink-soft">
                  {li.name} ×{li.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
