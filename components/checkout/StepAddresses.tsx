'use client';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCartContext } from '@/context/CartProvider';
import { useAccount } from '@/hooks/useAccount';
import { COUNTRY_CONFIG } from '@/lib/utils';
import type { Address } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const EMPTY: Address = {
  firstName: '', lastName: '', streetName: '', streetNumber: '',
  city: '', region: '', postalCode: '', phone: '', country: 'US',
};

function Field({
  label, value, onChange, required, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-charcoal-light">{label}{required && ' *'}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border bg-cream px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-charcoal"
      />
    </label>
  );
}

function AddressForm({
  value, onChange, country, showState,
}: {
  value: Address; onChange: (a: Address) => void; country: string; showState: boolean;
}) {
  const t = useTranslations('checkout');
  const set = (k: keyof Address, v: string) => onChange({ ...value, [k]: v, country });
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={t('firstName')} value={value.firstName ?? ''} onChange={(v) => set('firstName', v)} required />
      <Field label={t('lastName')} value={value.lastName ?? ''} onChange={(v) => set('lastName', v)} required />
      <div className="col-span-2"><Field label={t('street')} value={value.streetName ?? ''} onChange={(v) => set('streetName', v)} required /></div>
      <Field label={t('streetNumber')} value={value.streetNumber ?? ''} onChange={(v) => set('streetNumber', v)} />
      <Field label={t('city')} value={value.city ?? ''} onChange={(v) => set('city', v)} required />
      {showState && <Field label={t('state')} value={value.region ?? ''} onChange={(v) => set('region', v)} required />}
      <Field label={t('postalCode')} value={value.postalCode ?? ''} onChange={(v) => set('postalCode', v)} required />
      <Field label={t('phone')} value={value.phone ?? ''} onChange={(v) => set('phone', v)} />
    </div>
  );
}

export function StepAddresses() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const locale = useLocale();
  const { cart, mutateCart } = useCartContext();
  const { user } = useAccount();
  const country = COUNTRY_CONFIG[locale]?.country ?? 'US';
  const showState = country === 'US';

  const [shipping, setShipping] = useState<Address>({ ...EMPTY, country });
  const [billing, setBilling] = useState<Address>({ ...EMPTY, country });
  const [email, setEmail] = useState('');
  const [sameBilling, setSameBilling] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill the form once the cart loads (async); intentional sync from external data.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (cart?.shippingAddress?.streetName) setShipping({ ...EMPTY, ...cart.shippingAddress, country });
    if (cart?.billingAddress?.streetName) {
      setBilling({ ...EMPTY, ...cart.billingAddress, country });
      setSameBilling(false);
    }
    if (cart?.shippingAddress?.email) setEmail(cart.shippingAddress.email);
  }, [cart, country]);

  // Prefill from saved default addresses once the customer loads.
  useEffect(() => {
    if (!user) return;
    if (user.email && !email) setEmail(user.email);
    const ship = user.addresses?.find((a) => a.id === user.defaultShippingAddressId);
    const bill = user.addresses?.find((a) => a.id === user.defaultBillingAddressId);
    if (ship && !shipping.streetName) setShipping({ ...EMPTY, ...ship, country });
    if (bill && !billing.streetName) {
      setBilling({ ...EMPTY, ...bill, country });
      setSameBilling(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ship = { ...shipping, email, country };
      const bill = sameBilling ? { ...ship } : { ...billing, country };
      await mutateCart.setAddresses(ship, bill);
      router.push('/checkout/shipping');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('addressError'));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 text-lg font-medium text-charcoal">{t('contact')}</h2>
        <Field label={t('email')} type="email" value={email} onChange={setEmail} required />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-charcoal">{t('shippingAddress')}</h2>
        <AddressForm value={shipping} onChange={setShipping} country={country} showState={showState} />
      </section>

      <section>
        <label className="mb-4 flex items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} className="accent-charcoal" />
          {t('sameBilling')}
        </label>
        {!sameBilling && (
          <>
            <h2 className="mb-4 text-lg font-medium text-charcoal">{t('billingAddress')}</h2>
            <AddressForm value={billing} onChange={setBilling} country={country} showState={showState} />
          </>
        )}
      </section>

      {error && <p className="text-sm text-terra">{error}</p>}
      <Button type="submit" disabled={busy} className="self-start">
        {busy && <Spinner />} {t('continueToShipping')}
      </Button>
    </form>
  );
}
