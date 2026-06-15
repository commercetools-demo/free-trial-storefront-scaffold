import 'server-only';
import type {
  Customer,
  CustomerSignInResult,
  MyCustomerDraft,
  CustomerUpdateAction,
  BaseAddress,
} from '@commercetools/platform-sdk';
import { apiRoot } from './client';

/**
 * commercetools login. Pass anonymousCartId + MergeWithExistingCustomerCart so the
 * guest cart is preserved on sign-in. NEVER use apiRoot.customers().login().
 */
export async function signIn(
  email: string,
  password: string,
  anonymousCartId?: string,
): Promise<CustomerSignInResult> {
  const { body } = await apiRoot
    .login()
    .post({
      body: {
        email,
        password,
        ...(anonymousCartId
          ? { anonymousCartId, anonymousCartSignInMode: 'MergeWithExistingCustomerCart' }
          : {}),
      },
    })
    .execute();
  return body; // body.customer, body.cart (merged cart when present)
}

export async function signUp(draft: MyCustomerDraft): Promise<Customer> {
  const { body } = await apiRoot.customers().post({ body: draft }).execute();
  return body.customer;
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { body } = await apiRoot.customers().withId({ ID: id }).get().execute();
  return body;
}

async function updateCustomer(
  id: string,
  version: number,
  actions: CustomerUpdateAction[],
): Promise<Customer> {
  const { body } = await apiRoot
    .customers()
    .withId({ ID: id })
    .post({ body: { version, actions } })
    .execute();
  return body;
}

export async function addCustomerAddress(
  id: string,
  version: number,
  address: BaseAddress,
): Promise<Customer> {
  return updateCustomer(id, version, [{ action: 'addAddress', address }]);
}

export async function setProfile(
  id: string,
  version: number,
  firstName: string,
  lastName: string,
): Promise<Customer> {
  return updateCustomer(id, version, [
    { action: 'setFirstName', firstName },
    { action: 'setLastName', lastName },
  ]);
}
