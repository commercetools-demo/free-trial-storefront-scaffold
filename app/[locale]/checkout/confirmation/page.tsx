import { Link } from '@/i18n/routing';
import { getLocale } from '@/lib/session';
import { getOrderById, getOrderByNumber } from '@/lib/ct/orders';
import { mapOrder } from '@/lib/mappers/order';
import { formatMoney } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { CheckIcon } from '@/components/ui/icons';
import type { Order } from '@/lib/types';

type PageProps = {
  searchParams: Promise<{ orderId?: string; orderNumber?: string }>;
};

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { orderId, orderNumber } = await searchParams;
  const { locale } = await getLocale();

  let order: Order | null = null;
  try {
    if (orderId) order = mapOrder(await getOrderById(orderId), locale);
    else if (orderNumber) order = mapOrder(await getOrderByNumber(orderNumber), locale);
  } catch {
    order = null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-aurora text-white animate-fade-up">
        <CheckIcon width={40} height={40} />
      </div>
      <h1 className="mt-6 text-4xl font-black tracking-tight">Order confirmed!</h1>
      <p className="mt-2 text-ink/60">
        Thank you for shopping with LUMINA. A confirmation email is on its way.
      </p>

      {order ? (
        <div className="mt-8 rounded-3xl border border-border p-6 text-left">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="font-bold">Order #{order.orderNumber ?? order.id.slice(0, 8)}</span>
            <span className="font-black">{formatMoney(order.totalPrice, locale)}</span>
          </div>
          <ul className="mt-4 space-y-2">
            {order.lineItems.map((li) => (
              <li key={li.id} className="flex justify-between text-sm">
                <span className="text-ink-soft">
                  {li.name} ×{li.quantity}
                </span>
                <span className="font-medium">{formatMoney(li.totalPrice, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-8 rounded-2xl bg-mist px-4 py-6 text-sm text-ink/60">
          Your payment was successful and your order is being processed.
        </p>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/">
          <Button variant="primary" size="lg">
            Keep shopping
          </Button>
        </Link>
        <Link href="/account/orders">
          <Button variant="outline" size="lg">
            View orders
          </Button>
        </Link>
      </div>
    </div>
  );
}
