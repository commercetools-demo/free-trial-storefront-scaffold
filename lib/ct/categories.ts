import 'server-only';
import { unstable_cache } from 'next/cache';
import { apiRoot } from './client';
import { mapCategory, buildCategoryTree } from '@/lib/mappers/category';
import type { Category } from '@/lib/types';

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
  const flat = body.results.map((c) => mapCategory(c, locale));
  return buildCategoryTree(flat);
}

/** Category tree cached for 1h — changes rarely. */
export async function getCategoryTree(locale: string): Promise<Category[]> {
  const cached = unstable_cache(
    () => fetchCategoryTree(locale),
    ['category-tree', locale],
    { revalidate: 3600, tags: ['categories'] },
  );
  return cached();
}

/** Walk the in-memory tree to build a breadcrumb path to the target category. */
export function findCategoryPath(tree: Category[], categoryId: string): Category[] {
  const path: Category[] = [];
  const walk = (nodes: Category[], trail: Category[]): boolean => {
    for (const node of nodes) {
      const next = [...trail, node];
      if (node.id === categoryId) {
        path.push(...next);
        return true;
      }
      if (node.children.length && walk(node.children, next)) return true;
    }
    return false;
  };
  walk(tree, []);
  return path;
}
