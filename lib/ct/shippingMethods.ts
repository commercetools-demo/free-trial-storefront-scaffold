import { apiRoot } from './client';

export interface ShippingMethodOption {
  id: string;
  name: string;
  description?: string;
  price?: { centAmount: number; currencyCode: string };
}

/**
 * Shipping methods available for a cart — commercetools returns only methods
 * whose zone rate matches the cart's shipping address + currency.
 */
export async function getShippingMethodsForCart(cartId: string): Promise<ShippingMethodOption[]> {
  const { body } = await apiRoot
    .shippingMethods()
    .matchingCart()
    .get({ queryArgs: { cartId } })
    .execute();

  return body.results.map((sm) => {
    const zoneRate = sm.zoneRates?.[0];
    const rate = zoneRate?.shippingRates?.[0];
    return {
      id: sm.id,
      name: sm.name,
      description: sm.localizedDescription
        ? Object.values(sm.localizedDescription)[0]
        : sm.description,
      price: rate ? { centAmount: rate.price.centAmount, currencyCode: rate.price.currencyCode } : undefined,
    };
  });
}
