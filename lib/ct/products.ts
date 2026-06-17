import { ProductApi, type ProductQuery } from './product-api';
import { getSession } from '@/lib/session';
import type { Product, ProductSearchResult, SessionData } from '@/lib/types';

export async function searchProducts(
  query: ProductQuery,
  session?: Partial<SessionData>
): Promise<ProductSearchResult> {
  const s = session ?? (await getSession());
  return new ProductApi(s).query(query);
}

export async function getProductBySlug(
  slug: string,
  session?: Partial<SessionData>
): Promise<Product | null> {
  const s = session ?? (await getSession());
  return new ProductApi(s).getProductBySlug(slug);
}

export async function getProductBySku(
  sku: string,
  session?: Partial<SessionData>
): Promise<Product | null> {
  const s = session ?? (await getSession());
  return new ProductApi(s).getProductBySku(sku);
}
