import { apiRoot } from './client';
import type { Customer, MyCustomerDraft } from '@commercetools/platform-sdk';

/**
 * The only valid login endpoint in commercetools SDK v2.
 * NEVER use apiRoot.customers().login() — it does not exist.
 */
export async function loginCustomer(email: string, password: string): Promise<Customer> {
  const { body } = await apiRoot.login().post({ body: { email, password } }).execute();
  return body.customer;
}

export async function signUpCustomer(draft: MyCustomerDraft): Promise<Customer> {
  const { body } = await apiRoot.customers().post({ body: draft }).execute();
  return body.customer;
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { body } = await apiRoot.customers().withId({ ID: id }).get().execute();
  return body;
}
