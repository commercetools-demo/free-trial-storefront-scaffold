'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCartContext } from '@/context/CartProvider';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

export function StepPayment() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const locale = useLocale();
  const { cart } = useCartContext();
  const initialized = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: require an address + shipping method.
  useEffect(() => {
    if (cart === undefined) return;
    if (cart && !cart.shippingInfo) router.replace('/checkout/shipping');
  }, [cart, router]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const res = await fetch('/api/checkout/session', { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not start checkout');

        const { paymentFlow } = await import('@commercetools/checkout-browser-sdk');
        paymentFlow({
          projectKey: data.projectKey,
          region: data.region,
          sessionId: data.sessionId,
          locale,
          onInfo: (msg: { code?: string }) => {
            if (msg.code === 'checkout_completed') {
              router.push('/checkout/confirmation');
            }
          },
          onError: (err: { payload?: unknown; code?: unknown }) => {
            setError(String(err.payload ?? err.code ?? 'Payment error'));
          },
        });
        setLoading(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Could not start checkout');
        setLoading(false);
      }
    })();
  }, [locale, router]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-charcoal">{t('payment')}</h2>

      {loading && !error && (
        <div className="flex items-center gap-2 text-charcoal-light">
          <Spinner className="text-charcoal" /> {t('loadingPayment')}
        </div>
      )}

      {error && (
        <div className="rounded-sm border border-terra/40 bg-terra/5 p-4 text-sm text-charcoal">
          <p className="font-medium text-terra">{t('paymentFailed')}</p>
          <p className="mt-1 text-charcoal-light">{error}</p>
          <p className="mt-2 text-xs text-charcoal-light">
            {t('paymentNote', { key: 'storefront-checkout' })}
          </p>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => router.push('/checkout/shipping')}>{t('backToShipping')}</Button>
          </div>
        </div>
      )}

      {/* Required mount point for the commercetools Checkout widget. */}
      <div data-ctc />
    </div>
  );
}
