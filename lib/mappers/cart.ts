import 'server-only';
import type {
  Cart as CtCart,
  LineItem as CtLineItem,
  Address as CtAddress,
  TypedMoney,
  LocalizedString,
} from '@commercetools/platform-sdk';
import { getLocalizedString } from '@/lib/utils';
import type { Cart, CartLineItem, CartAddress, Money } from '@/lib/types';

function mapMoney(m: TypedMoney): Money {
  return { centAmount: m.centAmount, currencyCode: m.currencyCode, fractionDigits: m.fractionDigits };
}

export function mapAddress(a: CtAddress | undefined): CartAddress | undefined {
  if (!a) return undefined;
  return {
    firstName: a.firstName,
    lastName: a.lastName,
    streetName: a.streetName,
    streetNumber: a.streetNumber,
    postalCode: a.postalCode,
    city: a.city,
    region: a.region,
    state: a.state,
    country: a.country,
    email: a.email,
    phone: a.phone,
  };
}

function mapLineItem(li: CtLineItem, locale: string): CartLineItem {
  return {
    id: li.id,
    productId: li.productId,
    variantId: li.variant.id,
    name: getLocalizedString(li.name as LocalizedString, locale),
    slug: getLocalizedString(li.productSlug as LocalizedString | undefined, locale) || undefined,
    sku: li.variant.sku,
    image: li.variant.images?.[0]?.url,
    quantity: li.quantity,
    unitPrice: mapMoney(li.price.value),
    totalPrice: mapMoney(li.totalPrice),
  };
}

export function mapCart(cart: CtCart, locale: string): Cart {
  const subtotalCents = cart.lineItems.reduce((sum, li) => sum + li.totalPrice.centAmount, 0);
  return {
    id: cart.id,
    version: cart.version,
    lineItems: cart.lineItems.map((li) => mapLineItem(li, locale)),
    totalPrice: mapMoney(cart.totalPrice),
    subtotal: {
      centAmount: subtotalCents,
      currencyCode: cart.totalPrice.currencyCode,
      fractionDigits: cart.totalPrice.fractionDigits,
    },
    totalLineItemQuantity: cart.totalLineItemQuantity ?? 0,
    shippingAddress: mapAddress(cart.shippingAddress),
    billingAddress: mapAddress(cart.billingAddress),
    shippingInfo: cart.shippingInfo
      ? {
          shippingMethodName: cart.shippingInfo.shippingMethodName,
          price: mapMoney(cart.shippingInfo.price),
          shippingMethodId: cart.shippingInfo.shippingMethod?.id,
        }
      : undefined,
    discountCodes: (cart.discountCodes ?? [])
      .map((dc) => {
        const obj = dc.discountCode.obj;
        return {
          id: dc.discountCode.id,
          code: obj?.code ?? dc.discountCode.id,
          name: getLocalizedString(obj?.name as LocalizedString | undefined, locale) || undefined,
        };
      }),
    cartState: cart.cartState,
  };
}
