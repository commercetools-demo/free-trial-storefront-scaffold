import type {
  BusinessUnit as CtBusinessUnit,
  Address as CtAddress,
} from '@commercetools/platform-sdk';
import type { BusinessUnit, Address, Associate } from '@/lib/types';

export function mapAddress(a: CtAddress): Address {
  return {
    id: a.id,
    key: a.key,
    firstName: a.firstName,
    lastName: a.lastName,
    company: a.company,
    streetName: a.streetName,
    streetNumber: a.streetNumber,
    postalCode: a.postalCode,
    city: a.city,
    region: a.region,
    state: a.state,
    country: a.country,
    phone: a.phone,
    email: a.email,
  };
}

export function mapBusinessUnit(bu: CtBusinessUnit): BusinessUnit {
  const associates: Associate[] = (bu.associates ?? []).map((assoc) => ({
    customerId: assoc.customer?.id ?? '',
    email: (assoc.customer as { obj?: { email?: string } })?.obj?.email,
    firstName: (assoc.customer as { obj?: { firstName?: string } })?.obj?.firstName,
    lastName: (assoc.customer as { obj?: { lastName?: string } })?.obj?.lastName,
    roleKeys: (assoc.associateRoleAssignments ?? []).map((r) => r.associateRole.key),
  }));

  return {
    id: bu.id,
    version: bu.version,
    key: bu.key,
    name: bu.name,
    unitType: bu.unitType,
    status: bu.status,
    contactEmail: bu.contactEmail,
    associateCount: associates.length,
    associates,
    stores: (bu.stores ?? []).map((s) => ({ key: s.key ?? '' })),
    addresses: (bu.addresses ?? []).map(mapAddress),
    defaultShippingAddressId: bu.defaultShippingAddressId ?? undefined,
    defaultBillingAddressId: bu.defaultBillingAddressId ?? undefined,
    parentUnit: bu.parentUnit?.key ? { key: bu.parentUnit.key } : undefined,
  };
}
