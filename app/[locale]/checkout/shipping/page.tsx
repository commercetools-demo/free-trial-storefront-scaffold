'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useCartSWR, useCartMutations } from '@/hooks/useCart';
import { useShippingMethods } from '@/hooks/useShippingMethods';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Button, Card, Alert, EmptyState, Spinner } from '@/components/ui';
import { formatMoney } from '@/lib/utils';

export default function ShippingStep({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const { data: cart } = useCartSWR();
  const { apply } = useCartMutations();
  const { shippingMethods, isLoading } = useShippingMethods(!!cart);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Guard: redirect back if addresses are not set yet.
  useEffect(() => {
    if (cart === undefined) return;
    if (!cart || !cart.shippingAddress?.streetName) router.replace('/checkout/addresses');
  }, [cart, router]);

  if (cart === undefined || isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-terra" />
      </div>
    );
  }

  async function handleContinue() {
    if (!selected) {
      setError('Select a shipping method.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/cart/shipping-method', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shippingMethodId: selected }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to set shipping method');
      await apply((await res.json()).cart);
      router.push('/checkout/payment');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set shipping method');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CheckoutSteps current="shipping" />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          {error && <Alert tone="danger">{error}</Alert>}
          {shippingMethods.length === 0 ? (
            <EmptyState
              title="No shipping methods available"
              description="No shipping method matches this cart's destination and currency."
            />
          ) : (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-charcoal">Shipping method</h2>
              <div className="space-y-2">
                {shippingMethods.map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 text-sm ${
                      selected === m.id ? 'border-terra bg-terra/5' : 'border-border'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping-method"
                        checked={selected === m.id}
                        onChange={() => setSelected(m.id)}
                      />
                      <span>
                        <span className="font-medium text-charcoal">{m.name}</span>
                        {m.description && <span className="block text-xs text-charcoal-light">{m.description}</span>}
                      </span>
                    </span>
                    {m.price && (
                      <span className="text-charcoal">
                        {formatMoney(m.price.centAmount, m.price.currencyCode, locale)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="ghost" onClick={() => router.push('/checkout/addresses')}>
                  Back
                </Button>
                <Button onClick={handleContinue} disabled={saving}>
                  {saving ? 'Saving…' : 'Continue to payment'}
                </Button>
              </div>
            </Card>
          )}
        </div>
        <div className="lg:col-span-2">{cart && <OrderSummary cart={cart} locale={locale} />}</div>
      </div>
    </div>
  );
}
