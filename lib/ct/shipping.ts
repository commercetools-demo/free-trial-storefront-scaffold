import 'server-only';
import { unstable_cache } from 'next/cache';
import type { ShippingMethod as CtShippingMethod, LocalizedString } from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import type { ShippingMethod } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

async function fetchShippingMethods(): Promise<CtShippingMethod[]> {
  const { body } = await apiRoot.shippingMethods().get({ queryArgs: { limit: 100 } }).execute();
  return body.results;
}

const cachedShippingMethods = unstable_cache(fetchShippingMethods, ['shipping-methods'], {
  revalidate: 60,
});

/** Return only shipping methods that have a rate for the given currency. */
export async function getShippingMethodsForCurrency(
  currency: string,
  locale: string
): Promise<ShippingMethod[]> {
  const methods = await cachedShippingMethods();
  const out: ShippingMethod[] = [];
  for (const m of methods) {
    for (const zr of m.zoneRates) {
      const rate = zr.shippingRates.find((r) => r.price.currencyCode === currency);
      if (rate) {
        out.push({
          id: m.id,
          name: getLocalizedString(m.localizedName as LocalizedString, locale) || m.name,
          description:
            getLocalizedString(m.localizedDescription as LocalizedString | undefined, locale) ||
            m.description,
          price: { centAmount: rate.price.centAmount, currencyCode: rate.price.currencyCode },
          isDefault: !!m.isDefault,
        });
        break;
      }
    }
  }
  return out;
}
