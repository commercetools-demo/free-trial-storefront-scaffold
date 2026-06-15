'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useCartContext } from '@/context/CartContext';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import StepPayment from '@/components/checkout/StepPayment';
import Button from '@/components/ui/Button';

export default function PaymentStep() {
  const router = useRouter();
  const { cart } = useCartContext();

  useEffect(() => {
    if (cart === undefined) return;
    if (!cart || cart.lineItems.length === 0) {
      router.replace('/cart');
      return;
    }
    const hasAddr = !!(cart.shippingAddress?.streetName && cart.billingAddress?.streetName);
    const hasMethod = !!cart.shippingInfo;
    if (!hasAddr) router.replace('/checkout/addresses');
    else if (!hasMethod) router.replace('/checkout/shipping');
  }, [cart, router]);

  return (
    <CheckoutLayout step="payment">
      <StepPayment />
      <div className="mt-6">
        <Button variant="ghost" size="md" onClick={() => router.push('/checkout/shipping')}>
          Back to shipping
        </Button>
      </div>
    </CheckoutLayout>
  );
}
