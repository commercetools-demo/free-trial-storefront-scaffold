import 'server-only';
import type { Order as CtOrder, LocalizedString } from '@commercetools/platform-sdk';
import { getLocalizedString } from '@/lib/utils';
import { mapAddress } from './cart';
import type { Order } from '@/lib/types';

export function mapOrder(order: CtOrder, locale: string): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    orderState: order.orderState,
    lineItems: order.lineItems.map((li) => ({
      id: li.id,
      name: getLocalizedString(li.name as LocalizedString, locale),
      image: li.variant.images?.[0]?.url,
      quantity: li.quantity,
      totalPrice: {
        centAmount: li.totalPrice.centAmount,
        currencyCode: li.totalPrice.currencyCode,
        fractionDigits: li.totalPrice.fractionDigits,
      },
    })),
    totalPrice: {
      centAmount: order.totalPrice.centAmount,
      currencyCode: order.totalPrice.currencyCode,
      fractionDigits: order.totalPrice.fractionDigits,
    },
    shippingAddress: mapAddress(order.shippingAddress),
  };
}
