import { CheckoutShell } from '@/components/checkout/CheckoutShell';
import { StepShipping } from '@/components/checkout/StepShipping';

export const metadata = { title: 'Checkout · Shipping' };

export default function ShippingPage() {
  return (
    <CheckoutShell current="shipping">
      <StepShipping />
    </CheckoutShell>
  );
}
