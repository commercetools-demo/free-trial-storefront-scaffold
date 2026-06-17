export const COUNTRY_CONFIG: Record<string, { currency: string; locale: string; country: string; label: string }> = {
  'en-US': { locale: 'en-US', currency: 'USD', country: 'US', label: 'United States' },
  'en-GB': { locale: 'en-GB', currency: 'GBP', country: 'GB', label: 'United Kingdom' },
  'de-DE': { locale: 'de-DE', currency: 'EUR', country: 'DE', label: 'Germany' },
};

export const DEFAULT_LOCALE = COUNTRY_CONFIG['en-US'];

export function formatAddress(a: {
  firstName?: string;
  lastName?: string;
  company?: string;
  streetName?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  state?: string;
  country: string;
}): string {
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ');
  const street = [a.streetName, a.streetNumber].filter(Boolean).join(' ');
  const cityLine = [a.postalCode, a.city].filter(Boolean).join(' ');
  return [a.company, name, street, cityLine, a.region || a.state, a.country]
    .filter(Boolean)
    .join(', ');
}

export function formatMoney(centAmount: number, currencyCode: string, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode })
    .format(centAmount / 100);
}

export function getLocalizedString(obj: Record<string, string> | undefined, locale: string): string {
  if (!obj) return '';
  return obj[locale] ?? obj[locale.split('-')[0]] ?? Object.values(obj)[0] ?? '';
}

/**
 * Render an arbitrary commercetools attribute value as a display string —
 * handles enums ({ key, label }), localized text, booleans, numbers, money,
 * references, and arrays.
 */
export function formatAttributeValue(value: unknown, locale = 'en-US'): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map((v) => formatAttributeValue(v, locale)).join(', ');
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if ('label' in v) {
      const label = v.label;
      if (typeof label === 'string') return label;
      if (label && typeof label === 'object') return getLocalizedString(label as Record<string, string>, locale);
    }
    if ('key' in v && typeof v.key === 'string') return v.key;
    if ('centAmount' in v && 'currencyCode' in v) {
      return formatMoney(v.centAmount as number, v.currencyCode as string, locale);
    }
    if ('name' in v && typeof v.name === 'string') return v.name;
    // Localized text object
    const values = Object.values(v);
    if (values.every((x) => typeof x === 'string')) return getLocalizedString(v as Record<string, string>, locale);
  }
  return '';
}
