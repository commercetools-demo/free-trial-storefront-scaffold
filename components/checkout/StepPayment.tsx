'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSWRConfig } from 'swr';
import { paymentFlow } from '@commercetools/checkout-browser-sdk';
import { useLocale } from '@/context/LocaleContext';
import { KEY_CART } from '@/lib/cache-keys';
import Spinner from '@/components/ui/Spinner';

export default function StepPayment() {
  const router = useRouter();
  const { locale } = useLocale();
  const { mutate } = useSWRConfig();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const res = await fetch('/api/checkout/session', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Could not start payment.');
          setLoading(false);
          return;
        }

        const { sessionId, projectKey, region } = data;

        async function onCompleted(orderId?: string) {
          // commercetools already created the order — clear the cart from our session.
          await fetch('/api/checkout/complete', { method: 'POST' });
          mutate(KEY_CART, null, { revalidate: false });
          router.push(
            orderId ? `/checkout/confirmation?orderId=${orderId}` : '/checkout/confirmation',
          );
        }

        paymentFlow({
          projectKey,
          region,
          sessionId,
          locale,
          styles: {
            '--ctc-font-family': 'var(--font-inter)',
            '--ctc-primary-color': '#7b2ff7',
            '--ctc-border-radius': '9999px',
          },
          onInfo: (msg) => {
            if (msg.code === 'checkout_completed' || msg.code === 'order_created') {
              const payload = msg.payload as { orderId?: string; order?: { id?: string } } | undefined;
              onCompleted(payload?.orderId ?? payload?.order?.id);
            }
          },
          onError: (err) => {
            setError(String(err.payload ?? err.code ?? 'Payment error'));
          },
        });
        setLoading(false);
      } catch (e) {
        setError(String(e));
        setLoading(false);
      }
    })();
  }, [locale, router, mutate]);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Payment</h2>

      {loading && (
        <div className="flex items-center gap-3 rounded-xl bg-mist px-4 py-6 text-sm text-ink/60">
          <Spinner size={20} /> Preparing secure payment…
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Required mount point for the commercetools Checkout widget. */}
      <div data-ctc />

      <p className="mt-4 text-xs text-ink/40">
        Payments are securely processed by commercetools Checkout.
      </p>
    </div>
  );
}
