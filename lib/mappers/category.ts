import 'server-only';
import type { Category as CtCategory, LocalizedString } from '@commercetools/platform-sdk';
import { getLocalizedString } from '@/lib/utils';
import type { Category } from '@/lib/types';

export function mapCategory(c: CtCategory, locale: string): Category {
  return {
    id: c.id,
    name: getLocalizedString(c.name as LocalizedString, locale),
    slug: getLocalizedString(c.slug as LocalizedString, locale),
    description: getLocalizedString(c.description as LocalizedString | undefined, locale) || undefined,
    parent: c.parent ? { id: c.parent.id } : undefined,
    children: [],
    orderHint: c.orderHint,
  };
}

/** Build a nested tree (roots → children) from a flat category list. */
export function buildCategoryTree(categories: Category[]): Category[] {
  const byId = new Map<string, Category>();
  categories.forEach((c) => byId.set(c.id, { ...c, children: [] }));

  const roots: Category[] = [];
  byId.forEach((cat) => {
    if (cat.parent && byId.has(cat.parent.id)) {
      byId.get(cat.parent.id)!.children.push(cat);
    } else {
      roots.push(cat);
    }
  });

  const sortRec = (list: Category[]) => {
    list.sort((a, b) => (a.orderHint ?? '').localeCompare(b.orderHint ?? ''));
    list.forEach((c) => sortRec(c.children));
  };
  sortRec(roots);
  return roots;
}
