import 'server-only';
import { unstable_cache } from 'next/cache';
import type { LocalizedString } from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import { getLocalizedString } from '@/lib/utils';

async function fetchAttributeLabels(locale: string): Promise<Record<string, string>> {
  const { body } = await apiRoot.productTypes().get({ queryArgs: { limit: 100 } }).execute();
  const labels: Record<string, string> = {};
  for (const pt of body.results) {
    for (const attr of pt.attributes ?? []) {
      if (labels[attr.name]) continue;
      labels[attr.name] = getLocalizedString(attr.label as LocalizedString, locale) || attr.name;
    }
  }
  return labels;
}

export function getAttributeLabels(locale: string): Promise<Record<string, string>> {
  return unstable_cache(() => fetchAttributeLabels(locale), ['attribute-labels', locale], {
    revalidate: 3600,
  })();
}
