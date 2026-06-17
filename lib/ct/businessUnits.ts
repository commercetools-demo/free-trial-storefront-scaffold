import { apiRoot } from './client';
import { mapBusinessUnit } from '@/lib/mappers/businessUnit';
import type { BusinessUnit, Address } from '@/lib/types';
import type { BusinessUnitUpdateAction } from '@commercetools/platform-sdk';

/**
 * BU discovery uses a project-level call filtered by associate id — NOT the
 * as-associate chain (we don't yet have a businessUnitKey in the session).
 */
export async function getBusinessUnitsForAssociate(customerId: string): Promise<BusinessUnit[]> {
  const { body } = await apiRoot
    .businessUnits()
    .get({
      queryArgs: {
        where: `associates(customer(id="${customerId}"))`,
        expand: ['associates[*].customer', 'stores[*]'],
        limit: 100,
      },
    })
    .execute();
  return body.results.map(mapBusinessUnit);
}

export async function getBusinessUnitByKey(key: string): Promise<BusinessUnit> {
  const { body } = await apiRoot
    .businessUnits()
    .withKey({ key })
    .get({ queryArgs: { expand: ['associates[*].customer', 'stores[*]'] } })
    .execute();
  return mapBusinessUnit(body);
}

export async function updateBusinessUnit(
  key: string,
  version: number,
  actions: BusinessUnitUpdateAction[]
): Promise<BusinessUnit> {
  const { body } = await apiRoot
    .businessUnits()
    .withKey({ key })
    .post({ body: { version, actions } })
    .execute();
  return mapBusinessUnit(body);
}

export async function updateBusinessUnitDetails(
  key: string,
  version: number,
  data: { name?: string; contactEmail?: string }
): Promise<BusinessUnit> {
  const actions: BusinessUnitUpdateAction[] = [];
  if (data.name !== undefined) actions.push({ action: 'changeName', name: data.name });
  if (data.contactEmail !== undefined)
    actions.push({ action: 'setContactEmail', contactEmail: data.contactEmail });
  return updateBusinessUnit(key, version, actions);
}

export async function addBusinessUnitAddress(
  key: string,
  version: number,
  address: Address
): Promise<BusinessUnit> {
  return updateBusinessUnit(key, version, [
    {
      action: 'addAddress',
      address: {
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        streetName: address.streetName,
        streetNumber: address.streetNumber,
        postalCode: address.postalCode,
        city: address.city,
        region: address.region,
        state: address.state,
        country: address.country,
        phone: address.phone,
        email: address.email,
      },
    },
  ]);
}
