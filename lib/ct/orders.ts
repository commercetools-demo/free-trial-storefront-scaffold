import { apiRoot } from './client';
import { mapCart } from '@/lib/mappers/cart';
import type { Cart } from '@/lib/types';
import type { Order } from '@commercetools/platform-sdk';

// Orders within a BU are read through the as-associate chain.
function asAssociateOrders(associateId: string, businessUnitKey: string) {
  return apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .orders();
}

export interface OrderSummary {
  id: string;
  orderNumber?: string;
  orderState: string;
  createdAt: string;
  total: { centAmount: number; currencyCode: string };
  itemCount: number;
}

function summarize(order: Order): OrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    orderState: order.orderState ?? 'Open',
    createdAt: order.createdAt,
    total: { centAmount: order.totalPrice.centAmount, currencyCode: order.totalPrice.currencyCode },
    itemCount: (order.lineItems ?? []).reduce((s, li) => s + li.quantity, 0),
  };
}

export async function getOrderById(
  orderId: string,
  associateId: string,
  businessUnitKey: string,
  locale?: string
): Promise<{ summary: OrderSummary; cart: Cart; orderState: string }> {
  const { body } = await asAssociateOrders(associateId, businessUnitKey)
    .withId({ ID: orderId })
    .get()
    .execute();
  // Reuse the cart mapper for line items / totals (Order shares the shape).
  const cart = mapCart(body as unknown as Parameters<typeof mapCart>[0], locale);
  return { summary: summarize(body), cart, orderState: body.orderState ?? 'Open' };
}

export async function getOrdersForBusinessUnit(
  associateId: string,
  businessUnitKey: string
): Promise<OrderSummary[]> {
  const { body } = await asAssociateOrders(associateId, businessUnitKey)
    .get({ queryArgs: { sort: 'createdAt desc', limit: 50 } })
    .execute();
  return body.results.map(summarize);
}
