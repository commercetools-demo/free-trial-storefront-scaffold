import { Link } from '@/i18n/routing';
import { getSession } from '@/lib/session';
import { getOrderById } from '@/lib/ct/orders';
import { Card, Button, Badge } from '@/components/ui';
import { formatMoney } from '@/lib/utils';

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string; orderNumber?: string }>;
}) {
  const { locale } = await params;
  const { orderId } = await searchParams;
  const session = await getSession();

  let order: Awaited<ReturnType<typeof getOrderById>> | null = null;
  if (orderId && session.customerId && session.businessUnitKey) {
    try {
      order = await getOrderById(orderId, session.customerId, session.businessUnitKey, session.locale);
    } catch {
      order = null;
    }
  }

  const isApprovalPending = order?.orderState === 'Open';

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 text-sage">
          ✓
        </div>
        <h1 className="text-2xl font-semibold text-charcoal">Thank you for your order</h1>
        <p className="mt-2 text-charcoal-light">
          Your payment was processed and your order has been placed.
        </p>

        {order && (
          <div className="mt-6 rounded-lg border border-border p-5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-light">
                Order {order.summary.orderNumber ?? order.summary.id}
              </span>
              <Badge tone={isApprovalPending ? 'warning' : 'success'}>
                {isApprovalPending ? 'Awaiting approval' : order.summary.orderState}
              </Badge>
            </div>
            <p className="mt-3 text-lg font-semibold text-charcoal">
              {formatMoney(order.summary.total.centAmount, order.summary.total.currencyCode, locale)}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-charcoal-light">
              {order.cart.lineItems.map((li) => (
                <li key={li.id} className="flex justify-between">
                  <span>
                    {li.name} × {li.quantity}
                  </span>
                  <span>{formatMoney(li.totalPrice.centAmount, li.totalPrice.currencyCode, locale)}</span>
                </li>
              ))}
            </ul>
            {isApprovalPending && (
              <p className="mt-3 text-xs text-charcoal-light">
                This order triggered an approval rule. It will be fulfilled once an approver signs off.
                Track it under Approval flows.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/products">
            <Button variant="outline">Continue shopping</Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button>View orders</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
