import 'server-only';
import type { ShippingMethod as CtShippingMethod, LocalizedString } from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import { getLocalizedString } from '@/lib/utils';
import type { ShippingMethod } from '@/lib/types';

/** Shipping methods that have a rate for the given currency. */
export async function getShippingMethodsForCurrency(
  currency: string,
  locale: string,
): Promise<ShippingMethod[]> {
  const { body } = await apiRoot.shippingMethods().get({ queryArgs: { limit: 100 } }).execute();

  const methods: ShippingMethod[] = [];
  for (const m of body.results as CtShippingMethod[]) {
    for (const zoneRate of m.zoneRates ?? []) {
      const rate = zoneRate.shippingRates.find((r) => r.price.currencyCode === currency);
      if (rate) {
        methods.push({
          id: m.id,
          name: m.name,
          description:
            m.localizedDescription
              ? getLocalizedString(m.localizedDescription as LocalizedString, locale)
              : m.description,
          price: {
            centAmount: rate.price.centAmount,
            currencyCode: rate.price.currencyCode,
            fractionDigits: rate.price.fractionDigits,
          },
          isDefault: m.isDefault,
        });
        break;
      }
    }
  }
  return methods;
}
