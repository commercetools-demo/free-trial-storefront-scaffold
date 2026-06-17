'use client';
import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useCartContext } from '@/context/CartProvider';
import { Spinner } from '@/components/ui/Spinner';

export default function CheckoutIndexPage() {
  const router = useRouter();
  const { cart } = useCartContext();

  useEffect(() => {
    if (cart === undefined) return; // loading
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
    <div className="flex justify-center py-32">
      <Spinner className="h-6 w-6 text-charcoal" />
    </div>
  );
}
