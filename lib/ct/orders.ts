import 'server-only';
import type { Order } from '@commercetools/platform-sdk';
import { apiRoot } from './client';

export async function getOrderById(id: string): Promise<Order> {
  const { body } = await apiRoot.orders().withId({ ID: id }).get().execute();
  return body;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  const { body } = await apiRoot.orders().withOrderNumber({ orderNumber }).get().execute();
  return body;
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const { body } = await apiRoot
    .orders()
    .get({
      queryArgs: {
        where: `customerId="${customerId}"`,
        sort: 'createdAt desc',
        limit: 50,
      },
    })
    .execute();
  return body.results;
}
