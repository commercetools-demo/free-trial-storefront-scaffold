'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useCartContext } from '@/context/CartContext';
import { useLocale } from '@/context/LocaleContext';
import { useShippingMethods } from '@/hooks/useShippingMethods';
import { formatMoney } from '@/lib/utils';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function ShippingStep() {
  const router = useRouter();
  const { cart, mutateCart } = useCartContext();
  const { locale } = useLocale();
  const { data: methods, isLoading } = useShippingMethods();
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Guard: must have addresses first.
  useEffect(() => {
    if (cart === undefined) return;
    const hasAddr = !!(cart?.shippingAddress?.streetName && cart?.billingAddress?.streetName);
    if (!cart || cart.lineItems.length === 0) router.replace('/cart');
    else if (!hasAddr) router.replace('/checkout/addresses');
  }, [cart, router]);

  // Effective selection: explicit pick → current cart method → default → first.
  const selected =
    picked ??
    cart?.shippingInfo?.shippingMethodId ??
    methods?.find((m) => m.isDefault)?.id ??
    methods?.[0]?.id ??
    null;

  async function onContinue() {
    if (!selected) return;
    setBusy(true);
    const res = await mutateCart.setShippingMethod(selected);
    setBusy(false);
    if (!res.error) router.push('/checkout/payment');
  }

  return (
    <CheckoutLayout step="shipping">
      <h2 className="mb-4 text-lg font-bold">Shipping method</h2>

      {isLoading ? (
        <div className="grid place-items-center py-12">
          <Spinner size={28} />
        </div>
      ) : !methods || methods.length === 0 ? (
        <p className="rounded-xl bg-mist px-4 py-6 text-center text-sm text-ink/60">
          No shipping methods available for your region. Please contact support.
        </p>
      ) : (
        <div className="space-y-3">
          {methods.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 ${
                selected === m.id ? 'border-violet bg-violet/5' : 'border-border'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={selected === m.id}
                  onChange={() => setPicked(m.id)}
                  className="h-4 w-4 accent-violet"
                />
                <span>
                  <span className="block font-semibold">{m.name}</span>
                  {m.description && <span className="block text-xs text-ink/50">{m.description}</span>}
                </span>
              </span>
              <span className="font-bold">{formatMoney(m.price, locale)}</span>
            </label>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button variant="ghost" size="lg" onClick={() => router.push('/checkout/addresses')}>
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onContinue}
          disabled={!selected}
          isLoading={busy}
        >
          Continue to payment
        </Button>
      </div>
    </CheckoutLayout>
  );
}
