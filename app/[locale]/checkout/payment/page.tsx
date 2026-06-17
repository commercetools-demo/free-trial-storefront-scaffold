'use client';
import { use, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCartSWR } from '@/hooks/useCart';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Card, Alert, Spinner } from '@/components/ui';

export default function PaymentStep({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: routeLocale } = use(params);
  const locale = useLocale();
  const router = useRouter();
  const { data: cart } = useCartSWR();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  // Guard: must have addresses + shipping method.
  useEffect(() => {
    if (cart === undefined) return;
    if (!cart) {
      router.replace('/cart');
      return;
    }
    const hasAddr = !!(cart.shippingAddress?.streetName && cart.billingAddress?.streetName);
    if (!hasAddr) router.replace('/checkout/addresses');
    else if (!cart.shippingInfo) router.replace('/checkout/shipping');
  }, [cart, router]);

  useEffect(() => {
    if (initialized.current || !cart?.shippingInfo) return;
    initialized.current = true;

    (async () => {
      try {
        const sessionRes = await fetch('/api/checkout/session', { method: 'POST' });
        if (!sessionRes.ok) {
          throw new Error((await sessionRes.json().catch(() => ({}))).error || 'Could not start payment');
        }
        const { sessionId, projectKey, region } = await sessionRes.json();

        const { paymentFlow } = await import('@commercetools/checkout-browser-sdk');
        paymentFlow({
          projectKey,
          region,
          sessionId,
          locale,
          styles: {
            '--font-family': 'var(--font-sans)',
            '--color-primary': '#b5724a',
            '--color-primary-hover': '#9a5f3a',
            '--border-radius': '0.375rem',
          },
          onInfo: async (msg: { code?: string }) => {
            if (msg.code === 'checkout_completed') {
              await fetch('/api/checkout/complete', { method: 'POST' });
              router.push('/checkout/confirmation' as `/${string}`);
            }
          },
          onError: (err: { payload?: unknown; code?: string }) => {
            setError(String(err.payload ?? err.code ?? 'Payment error'));
          },
        });
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not start payment');
        setLoading(false);
      }
    })();
  }, [cart, locale, router]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CheckoutSteps current="payment" />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-charcoal">Payment</h2>
            {error && (
              <div className="mb-4">
                <Alert tone="danger">{error}</Alert>
              </div>
            )}
            {loading && !error && (
              <div className="flex items-center gap-2 py-6 text-sm text-charcoal-light">
                <Spinner className="text-terra" /> Loading secure payment…
              </div>
            )}
            {/* Required mount point — the Checkout widget renders here. */}
            <div data-ctc />
          </Card>
          <p className="mt-3 text-xs text-charcoal-light">
            Payment is processed securely by commercetools Checkout. Your order is created
            automatically once payment succeeds.
          </p>
        </div>
        <div className="lg:col-span-2">{cart && <OrderSummary cart={cart} locale={routeLocale} />}</div>
      </div>
    </div>
  );
}
