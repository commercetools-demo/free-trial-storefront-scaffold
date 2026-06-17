// Client-safe helpers for reading commercetools attribute values (already mapped to app Variant).
import type { Variant, ProductAttribute } from '@/lib/types';

/** Normalise an attribute value to a stable key string (for matching/grouping). */
export function attrKey(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('key' in obj) return String(obj.key);
    // localized string — pick first value
    const first = Object.values(obj)[0];
    return first != null ? String(first) : '';
  }
  return String(value);
}

/** Human-readable label for an attribute value. */
export function attrLabel(value: unknown, locale: string): string {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('label' in obj) {
      const label = obj.label;
      if (typeof label === 'object' && label) {
        const l = label as Record<string, string>;
        return l[locale] ?? l[locale.split('-')[0]] ?? Object.values(l)[0] ?? '';
      }
      return String(label);
    }
    // localized string
    const l = obj as Record<string, string>;
    return l[locale] ?? l[locale.split('-')[0]] ?? Object.values(l)[0] ?? '';
  }
  return String(value);
}

export function getAttr(variant: Variant, name: string): ProductAttribute | undefined {
  return variant.attributes.find((a) => a.name === name);
}
