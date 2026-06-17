import 'server-only';
import { unstable_cache } from 'next/cache';
import type { Category as CtCategory, LocalizedString } from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import type { Category } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

function mapCategory(c: CtCategory, locale: string): Category {
  return {
    id: c.id,
    name: getLocalizedString(c.name as LocalizedString, locale),
    slug: getLocalizedString(c.slug as LocalizedString, locale),
    parent: c.parent ? { id: c.parent.id } : undefined,
    orderHint: c.orderHint,
  };
}

export async function getCategoryBySlug(slug: string, locale: string): Promise<Category | null> {
  const { body } = await apiRoot
    .categories()
    .get({ queryArgs: { where: `slug(${locale}="${slug}")`, limit: 1 } })
    .execute();
  const c = body.results[0];
  return c ? mapCategory(c, locale) : null;
}

export async function getCategoryById(id: string, locale: string): Promise<Category | null> {
  try {
    const { body } = await apiRoot.categories().withId({ ID: id }).get().execute();
    return mapCategory(body, locale);
  } catch {
    return null;
  }
}

async function fetchCategoryTree(locale: string): Promise<Category[]> {
  const { body } = await apiRoot
    .categories()
    .get({ queryArgs: { limit: 500, sort: 'orderHint asc' } })
    .execute();
  const all = body.results.map((c) => mapCategory(c, locale));
  const byId = new Map<string, Category>();
  all.forEach((c) => byId.set(c.id, { ...c, children: [] }));
  const roots: Category[] = [];
  for (const c of byId.values()) {
    if (c.parent && byId.has(c.parent.id)) {
      byId.get(c.parent.id)!.children!.push(c);
    } else if (!c.parent) {
      roots.push(c);
    }
  }
  return roots;
}

export function getCategoryTree(locale: string): Promise<Category[]> {
  return unstable_cache(() => fetchCategoryTree(locale), ['category-tree', locale], {
    revalidate: 60,
  })();
}

/** Walk the in-memory tree to build a breadcrumb path (root → ... → target). */
export function buildBreadcrumb(tree: Category[], categoryId: string): Category[] {
  const path: Category[] = [];
  function dfs(nodes: Category[], trail: Category[]): boolean {
    for (const node of nodes) {
      const next = [...trail, node];
      if (node.id === categoryId) {
        path.push(...next);
        return true;
      }
      if (node.children && dfs(node.children, next)) return true;
    }
    return false;
  }
  dfs(tree, []);
  return path;
}
