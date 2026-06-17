import 'server-only';
import type { Cart as CtCart, LineItem, Order as CtOrder } from '@commercetools/platform-sdk';
import type { Cart, CartLineItem, OrderSummary, Address } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

function mapLineItem(li: LineItem, locale: string): CartLineItem {
  const unit = li.price;
  const effective = unit.discounted?.value ?? unit.value;
  return {
    id: li.id,
    productId: li.productId,
    variantId: li.variant.id,
    name: getLocalizedString(li.name, locale),
    slug: li.productSlug ? getLocalizedString(li.productSlug, locale) : undefined,
    sku: li.variant.sku,
    image: li.variant.images?.[0]?.url,
    quantity: li.quantity,
    unitPrice: {
      centAmount: effective.centAmount,
      currencyCode: effective.currencyCode,
      discounted: unit.discounted
        ? { centAmount: unit.discounted.value.centAmount, currencyCode: unit.discounted.value.currencyCode }
        : undefined,
    },
    totalPrice: {
      centAmount: li.totalPrice.centAmount,
      currencyCode: li.totalPrice.currencyCode,
    },
  };
}

function mapAddress(a: CtCart['shippingAddress']): Address | undefined {
  if (!a) return undefined;
  return {
    id: a.id,
    firstName: a.firstName,
    lastName: a.lastName,
    streetName: a.streetName,
    streetNumber: a.streetNumber,
    additionalStreetInfo: a.additionalStreetInfo,
    postalCode: a.postalCode,
    city: a.city,
    region: a.region,
    state: a.state,
    country: a.country,
    phone: a.phone,
    email: a.email,
  };
}

export function mapCart(c: CtCart, locale: string): Cart {
  const lineItems = c.lineItems.map((li) => mapLineItem(li, locale));
  const subtotalCents = lineItems.reduce((sum, li) => sum + li.totalPrice.centAmount, 0);
  const shippingInfo = c.shippingInfo
    ? {
        methodName: c.shippingInfo.shippingMethodName,
        price: {
          centAmount: c.shippingInfo.price.centAmount,
          currencyCode: c.shippingInfo.price.currencyCode,
        },
      }
    : null;
  return {
    id: c.id,
    version: c.version,
    lineItems,
    totalPrice: { centAmount: c.totalPrice.centAmount, currencyCode: c.totalPrice.currencyCode },
    subtotal: { centAmount: subtotalCents, currencyCode: c.totalPrice.currencyCode },
    shippingAddress: mapAddress(c.shippingAddress),
    billingAddress: mapAddress(c.billingAddress),
    shippingInfo,
    discountCodes: (c.discountCodes ?? []).map((d) => ({
      id: d.discountCode.id,
      code: d.discountCode.obj?.code ?? '',
      state: d.state,
    })),
    totalLineItemQuantity: c.totalLineItemQuantity ?? lineItems.reduce((s, li) => s + li.quantity, 0),
    currency: c.totalPrice.currencyCode,
    country: c.country,
  };
}

export function mapOrder(o: CtOrder, locale: string): OrderSummary {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    state: o.orderState ?? 'Open',
    totalPrice: { centAmount: o.totalPrice.centAmount, currencyCode: o.totalPrice.currencyCode },
    lineItems: o.lineItems.map((li) => mapLineItem(li, locale)),
  };
}
