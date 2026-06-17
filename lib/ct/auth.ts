import 'server-only';
import type {
  Customer,
  CustomerSignInResult,
  MyCustomerDraft,
  BaseAddress,
} from '@commercetools/platform-sdk';
import { apiRoot } from './client';

/** Login (with optional anonymous-cart merge). Uses apiRoot.login() — never customers().login(). */
export async function signIn(
  email: string,
  password: string,
  anonymousCartId?: string
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
  return body;
}

export async function signUp(draft: MyCustomerDraft): Promise<Customer> {
  const { body } = await apiRoot.customers().post({ body: draft }).execute();
  return body.customer;
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { body } = await apiRoot.customers().withId({ ID: id }).get().execute();
  return body;
}

export async function addAddress(
  customerId: string,
  version: number,
  address: BaseAddress
): Promise<Customer> {
  const { body } = await apiRoot
    .customers()
    .withId({ ID: customerId })
    .post({ body: { version, actions: [{ action: 'addAddress', address }] } })
    .execute();
  return body;
}
