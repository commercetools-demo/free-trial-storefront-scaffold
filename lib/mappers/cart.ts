import type { Cart as CtCart, LineItem as CtLineItem } from '@commercetools/platform-sdk';
import type { Cart, CartLineItem, Address } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';
import { mapAddress } from './businessUnit';

function mapLineItem(li: CtLineItem, locale: string): CartLineItem {
  return {
    id: li.id,
    productId: li.productId,
    variantId: li.variant.id,
    name: getLocalizedString(li.name as Record<string, string>, locale),
    slug: li.productSlug ? getLocalizedString(li.productSlug as Record<string, string>, locale) : undefined,
    sku: li.variant.sku,
    quantity: li.quantity,
    image: li.variant.images?.[0]?.url,
    unitPrice: {
      centAmount: li.price.value.centAmount,
      currencyCode: li.price.value.currencyCode,
      discounted: li.price.discounted
        ? {
            centAmount: li.price.discounted.value.centAmount,
            currencyCode: li.price.discounted.value.currencyCode,
          }
        : undefined,
    },
    totalPrice: {
      centAmount: li.totalPrice.centAmount,
      currencyCode: li.totalPrice.currencyCode,
    },
  };
}

export function mapCart(cart: CtCart, locale = 'en-US'): Cart {
  const lineItems = (cart.lineItems ?? []).map((li) => mapLineItem(li, locale));
  return {
    id: cart.id,
    version: cart.version,
    lineItems,
    totalPrice: {
      centAmount: cart.totalPrice.centAmount,
      currencyCode: cart.totalPrice.currencyCode,
    },
    currency: cart.totalPrice.currencyCode,
    country: cart.country,
    customerId: cart.customerId,
    businessUnitKey: cart.businessUnit?.key,
    storeKey: cart.store?.key,
    shippingAddress: cart.shippingAddress ? (mapAddress(cart.shippingAddress) as Address) : undefined,
    billingAddress: cart.billingAddress ? (mapAddress(cart.billingAddress) as Address) : undefined,
    shippingInfo: cart.shippingInfo
      ? {
          shippingMethodName: cart.shippingInfo.shippingMethodName,
          price: {
            centAmount: cart.shippingInfo.price.centAmount,
            currencyCode: cart.shippingInfo.price.currencyCode,
          },
        }
      : null,
    itemCount: lineItems.reduce((sum, li) => sum + li.quantity, 0),
  };
}
