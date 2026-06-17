import { CheckoutShell } from '@/components/checkout/CheckoutShell';
import { StepPayment } from '@/components/checkout/StepPayment';

export const metadata = { title: 'Checkout · Payment' };

export default function PaymentPage() {
  return (
    <CheckoutShell current="payment">
      <StepPayment />
    </CheckoutShell>
  );
}
