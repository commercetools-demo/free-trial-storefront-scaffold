'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useCartContext } from '@/context/CartContext';
import { useAccount } from '@/hooks/useAccount';
import { useLocale } from '@/context/LocaleContext';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import AddressFields, {
  EMPTY_ADDRESS,
  fromCartAddress,
  toCartAddress,
  type AddressState,
} from '@/components/checkout/AddressFields';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AddressStep() {
  const router = useRouter();
  const { cart, mutateCart } = useCartContext();
  const { user } = useAccount();
  const { country } = useLocale();

  const [shipping, setShipping] = useState<AddressState>({ ...EMPTY_ADDRESS });
  const [billing, setBilling] = useState<AddressState>({ ...EMPTY_ADDRESS });
  const [sameBilling, setSameBilling] = useState(true);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Prefill the form once, from cart then customer default shipping address.
  // Syncing form defaults from the async cart/account stores is a legitimate one-time init.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hydrated || cart === undefined) return;
    if (cart?.shippingAddress) setShipping(fromCartAddress(cart.shippingAddress));
    if (cart?.billingAddress) {
      setBilling(fromCartAddress(cart.billingAddress));
      setSameBilling(false);
    }
    if (user) {
      setEmail(user.email);
      const def = user.addresses.find((a) => a.id === user.defaultShippingAddressId);
      if (def && !cart?.shippingAddress) setShipping(fromCartAddress(def));
    }
    setHydrated(true);
  }, [cart, user, hydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (cart === undefined) return;
    if (!cart || cart.lineItems.length === 0) router.replace('/cart');
  }, [cart, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const shippingAddr = toCartAddress(shipping, country);
    const billingAddr = sameBilling ? shippingAddr : toCartAddress(billing, country);
    const res = await mutateCart.setAddresses(shippingAddr, billingAddr, email || user?.email);
    setBusy(false);
    if (!res.error) router.push('/checkout/shipping');
  }

  return (
    <CheckoutLayout step="addresses">
      <form onSubmit={onSubmit} className="space-y-8">
        {!user && (
          <section>
            <h2 className="mb-3 text-lg font-bold">Contact</h2>
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-bold">Shipping address</h2>
          <AddressFields value={shipping} onChange={setShipping} country={country} idPrefix="ship" />
        </section>

        <section>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={sameBilling}
              onChange={(e) => setSameBilling(e.target.checked)}
              className="h-4 w-4 accent-violet"
            />
            Billing address same as shipping
          </label>

          {!sameBilling && (
            <div className="mt-4">
              <h2 className="mb-3 text-lg font-bold">Billing address</h2>
              <AddressFields value={billing} onChange={setBilling} country={country} idPrefix="bill" />
            </div>
          )}
        </section>

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={busy}>
          Continue to shipping
        </Button>
      </form>
    </CheckoutLayout>
  );
}
