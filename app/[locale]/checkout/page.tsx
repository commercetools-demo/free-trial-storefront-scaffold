'use client';
import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useCartSWR } from '@/hooks/useCart';
import { Spinner } from '@/components/ui';

export default function CheckoutIndexPage() {
  const router = useRouter();
  const { data: cart } = useCartSWR();

  useEffect(() => {
    if (cart === undefined) return; // still loading
    if (!cart || cart.lineItems.length === 0) {
      router.replace('/cart');
      return;
    }
    const hasAddr = !!(cart.shippingAddress?.streetName && cart.billingAddress?.streetName);
    const hasMethod = !!cart.shippingInfo;
    if (hasAddr && hasMethod) router.replace('/checkout/payment');
    else if (hasAddr) router.replace('/checkout/shipping');
    else router.replace('/checkout/addresses');
  }, [cart, router]);

  return (
    <div className="flex justify-center py-24">
      <Spinner className="text-terra" />
    </div>
  );
}
