'use client';
import { use, useEffect, useMemo, useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useCartSWR, useCartMutations } from '@/hooks/useCart';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Button, Card, Alert, EmptyState, Spinner } from '@/components/ui';
import { formatAddress } from '@/lib/utils';
import type { Address } from '@/lib/types';

export default function AddressesStep({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const { data: cart } = useCartSWR();
  const { apply } = useCartMutations();
  const { currentBusinessUnit } = useBusinessUnit();

  const addresses = useMemo(() => currentBusinessUnit?.addresses ?? [], [currentBusinessUnit]);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [billingId, setBillingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentBusinessUnit) return;
    const ship = currentBusinessUnit.defaultShippingAddressId ?? addresses[0]?.id ?? null;
    const bill = currentBusinessUnit.defaultBillingAddressId ?? ship;
    setShippingId((s) => s ?? ship);
    setBillingId((b) => b ?? bill);
  }, [currentBusinessUnit, addresses]);

  if (cart === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-terra" />
      </div>
    );
  }

  function addressById(id: string | null): Address | undefined {
    return addresses.find((a) => a.id === id);
  }

  async function handleContinue() {
    setError(null);
    const shipping = addressById(shippingId);
    const billing = addressById(billingId);
    if (!shipping) {
      setError('Select a shipping address.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/cart/addresses', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shippingAddress: shipping, billingAddress: billing ?? shipping }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to save addresses');
      await apply((await res.json()).cart);
      router.push('/checkout/shipping');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save addresses');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CheckoutSteps current="addresses" />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          {error && <Alert tone="danger">{error}</Alert>}

          {addresses.length === 0 ? (
            <EmptyState
              title="No addresses on this business unit"
              description="An administrator must add addresses to your business unit before you can check out."
              action={
                <Link href="/dashboard/company">
                  <Button variant="outline">Manage company</Button>
                </Link>
              }
            />
          ) : (
            <>
              <AddressGroup
                title="Shipping address"
                addresses={addresses}
                selectedId={shippingId}
                onSelect={setShippingId}
                name="shipping"
              />
              <AddressGroup
                title="Billing address"
                addresses={addresses}
                selectedId={billingId}
                onSelect={setBillingId}
                name="billing"
              />
              <div className="flex justify-end">
                <Button onClick={handleContinue} disabled={saving} size="lg">
                  {saving ? 'Saving…' : 'Continue to shipping'}
                </Button>
              </div>
            </>
          )}
        </div>
        <div className="lg:col-span-2">{cart && <OrderSummary cart={cart} locale={locale} />}</div>
      </div>
    </div>
  );
}

function AddressGroup({
  title,
  addresses,
  selectedId,
  onSelect,
  name,
}: {
  title: string;
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  name: string;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-sm font-semibold text-charcoal">{title}</h2>
      <div className="space-y-2">
        {addresses.map((a) => (
          <label
            key={a.id}
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
              selectedId === a.id ? 'border-terra bg-terra/5' : 'border-border'
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={selectedId === a.id}
              onChange={() => a.id && onSelect(a.id)}
              className="mt-1"
            />
            <span className="text-charcoal-light">{formatAddress(a)}</span>
          </label>
        ))}
      </div>
    </Card>
  );
}
