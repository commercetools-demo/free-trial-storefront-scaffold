import { CheckoutShell } from '@/components/checkout/CheckoutShell';
import { StepAddresses } from '@/components/checkout/StepAddresses';

export const metadata = { title: 'Checkout · Address' };

export default function AddressesPage() {
  return (
    <CheckoutShell current="addresses">
      <StepAddresses />
    </CheckoutShell>
  );
}
