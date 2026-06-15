import 'server-only';
import type { Customer as CtCustomer } from '@commercetools/platform-sdk';
import { mapAddress } from './cart';
import type { Customer } from '@/lib/types';

export function mapCustomer(c: CtCustomer): Customer {
  return {
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    addresses: (c.addresses ?? []).map((a) => ({ ...mapAddress(a)!, id: a.id })),
    defaultShippingAddressId: c.defaultShippingAddressId,
    defaultBillingAddressId: c.defaultBillingAddressId,
  };
}
