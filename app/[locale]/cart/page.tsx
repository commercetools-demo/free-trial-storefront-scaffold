'use client';
import { use, useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useCartSWR } from '@/hooks/useCart';
import { useAccount } from '@/hooks/useAccount';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { Button, Card, EmptyState, Spinner, Alert } from '@/components/ui';
import { formatMoney } from '@/lib/utils';

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { data: cart, isLoading } = useCartSWR();
  const { user } = useAccount();
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl justify-center px-4 py-24">
        <Spinner className="text-terra" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <EmptyState
          title="Sign in to view your cart"
          description="Your cart is tied to your business unit."
          action={
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!cart || cart.lineItems.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          description="Browse the catalog to add items."
          action={
            <Link href="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  async function requestQuote() {
    setError(null);
    setRequesting(true);
    try {
      const res = await fetch('/api/quote-requests', { method: 'POST' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to request quote');
      const { quoteRequestId } = await res.json();
      router.push(`/dashboard/quotes${quoteRequestId ? `?highlight=${quoteRequestId}` : ''}` as `/${string}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to request quote');
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-charcoal">Cart</h1>
      {error && (
        <div className="mb-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="divide-y divide-border px-4">
            {cart.lineItems.map((item) => (
              <CartItemRow key={item.id} item={item} locale={locale} />
            ))}
          </Card>
        </div>

        <div>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-charcoal">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal-light">Items</dt>
                <dd className="text-charcoal">{cart.itemCount}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatMoney(cart.totalPrice.centAmount, cart.totalPrice.currencyCode, locale)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-charcoal-light">Taxes and shipping calculated at checkout.</p>

            <div className="mt-5 space-y-2">
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Proceed to checkout
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={requestQuote}
                disabled={requesting}
              >
                {requesting ? 'Submitting…' : 'Request a quote'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
