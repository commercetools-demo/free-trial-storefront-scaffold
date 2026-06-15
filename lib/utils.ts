import type { Money } from './types';

export const COUNTRY_CONFIG: Record<
  string,
  { currency: string; locale: string; country: string; label: string; flag: string }
> = {
  'en-US': { locale: 'en-US', currency: 'USD', country: 'US', label: 'United States', flag: '🇺🇸' },
  'en-GB': { locale: 'en-GB', currency: 'GBP', country: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  'de-DE': { locale: 'de-DE', currency: 'EUR', country: 'DE', label: 'Germany', flag: '🇩🇪' },
};

export const DEFAULT_LOCALE = COUNTRY_CONFIG['en-US'];

export function formatMoney(money: Money | undefined, locale = 'en-US'): string {
  if (!money) return '';
  const digits = money.fractionDigits ?? 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
  }).format(money.centAmount / Math.pow(10, digits));
}

export function formatCentAmount(centAmount: number, currencyCode: string, locale = 'en-US'): string {
  return formatMoney({ centAmount, currencyCode, fractionDigits: 2 }, locale);
}

export function getLocalizedString(
  obj: Record<string, string> | undefined,
  locale: string,
): string {
  if (!obj) return '';
  return obj[locale] ?? obj[locale.split('-')[0]] ?? Object.values(obj)[0] ?? '';
}
