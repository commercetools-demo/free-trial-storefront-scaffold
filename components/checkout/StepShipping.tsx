'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCartContext } from '@/context/CartProvider';
import { useShippingMethods } from '@/hooks/useShippingMethods';
import { COUNTRY_CONFIG } from '@/lib/utils';
import { Money } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function StepShipping() {
  const t = useTranslations('checkout');
  const tc = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();
  const cfg = COUNTRY_CONFIG[locale];
  const { cart, mutateCart } = useCartContext();
  const { methods, isLoading } = useShippingMethods(cfg?.country, cfg?.currency);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Guard: need an address first.
  useEffect(() => {
    if (cart === undefined) return;
    if (cart && !cart.shippingAddress?.streetName) router.replace('/checkout/addresses');
  }, [cart, router]);

  // Seed the selection once shipping methods load (async); intentional sync from external data.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (selected) return;
    if (cart?.shippingInfo) {
      const m = methods.find((x) => x.name === cart.shippingInfo!.methodName);
      if (m) setSelected(m.id);
    } else if (methods.length) {
      setSelected(methods.find((m) => m.isDefault)?.id ?? methods[0].id);
    }
  }, [methods, cart, selected]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function onContinue() {
    if (!selected) return;
    setBusy(true);
    try {
      await mutateCart.setShippingMethod(selected);
      router.push('/checkout/payment');
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return <div className="flex py-12"><Spinner className="h-6 w-6 text-charcoal" /></div>;
  }

  if (methods.length === 0) {
    return (
      <div className="rounded-sm border border-border p-6 text-sm text-charcoal-light">
        {t('noMethods')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-medium text-charcoal">{t('shippingMethod')}</h2>
      <ul className="space-y-3">
        {methods.map((m) => (
          <li key={m.id}>
            <label
              className={`flex cursor-pointer items-center justify-between rounded-sm border px-4 py-3 ${
                selected === m.id ? 'border-charcoal' : 'border-border'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="ship"
                  checked={selected === m.id}
                  onChange={() => setSelected(m.id)}
                  className="accent-charcoal"
                />
                <span>
                  <span className="block text-sm font-medium text-charcoal">{m.name}</span>
                  {m.description && <span className="block text-xs text-charcoal-light">{m.description}</span>}
                </span>
              </span>
              <span className="text-sm text-charcoal">
                <Money centAmount={m.price.centAmount} currencyCode={m.price.currencyCode} />
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => router.push('/checkout/addresses')}>{tc('back')}</Button>
        <Button onClick={onContinue} disabled={!selected || busy}>
          {busy && <Spinner />} {t('continueToPayment')}
        </Button>
      </div>
    </div>
  );
}
