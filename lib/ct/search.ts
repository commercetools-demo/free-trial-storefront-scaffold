import 'server-only';
import type {
  ProductSearchRequest,
  ProductProjection,
  ProductSearchFacetResult,
  ProductSearchFacetResultBucket,
  ProductSearchFacetResultBucketEntry,
  _SearchQuery,
} from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import { mapProduct } from '@/lib/mappers/product';
import type { Product, FacetResult, FacetBucket } from '@/lib/types';
import {
  getSearchableAttributes,
  buildFacets,
  buildPostFilter,
  rangeBucketKey,
  parseRangeKey,
  type FacetMeta,
} from './facets';

export interface SearchParams {
  text?: string;
  categoryId?: string;
  locale: string;
  currency: string;
  country: string;
  sort?: string; // e.g. 'price-asc' | 'price-desc' | 'name-asc'
  limit?: number;
  offset?: number;
  selections?: Record<string, string>;
  withFacets?: boolean;
}

export interface SearchResult {
  products: Product[];
  total: number;
  offset: number;
  limit: number;
  facets: FacetResult[];
}

function buildSort(sort: string | undefined, locale: string): ProductSearchRequest['sort'] {
  switch (sort) {
    case 'price-asc':
      return [{ field: 'variants.prices.centAmount', order: 'asc', mode: 'min' }];
    case 'price-desc':
      return [{ field: 'variants.prices.centAmount', order: 'desc', mode: 'max' }];
    case 'name-asc':
      return [{ field: 'name', language: locale, order: 'asc' }];
    case 'name-desc':
      return [{ field: 'name', language: locale, order: 'desc' }];
    default:
      return undefined;
  }
}

function mapFacetResults(
  results: ProductSearchFacetResult[] | undefined,
  meta: Record<string, FacetMeta>,
  locale: string
): FacetResult[] {
  if (!results) return [];
  const out: FacetResult[] = [];
  for (const r of results) {
    const m = meta[r.name];
    if (!m) continue;
    const buckets: FacetBucket[] = [];
    const rawBuckets = (r as ProductSearchFacetResultBucket).buckets ?? [];
    for (const b of rawBuckets) {
      if (!b.count) continue;
      if (m.kind === 'ranges') {
        buckets.push({ key: rangeBucketKey(b), label: rangeLabel(b, locale, m), count: b.count });
      } else {
        const key = String(b.key);
        buckets.push({ key, label: distinctLabel(key, m), count: b.count });
      }
    }
    if (buckets.length > 0) out.push({ name: r.name, kind: m.kind, buckets });
  }
  return out;
}

function distinctLabel(key: string, m: FacetMeta): string {
  if (m.fieldType === 'boolean') return key === 'true' ? 'In stock' : 'Out of stock';
  return key;
}

function rangeLabel(b: ProductSearchFacetResultBucketEntry, locale: string, m: FacetMeta): string {
  const isMoney = m.name === 'price';
  const fmt = (n: number) =>
    isMoney
      ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n / 100)
      : String(Math.round(n));
  const bounds = parseRangeKey(b.key);
  const from = bounds?.gte;
  const to = bounds?.lte;
  if (from !== undefined && to !== undefined) return `${fmt(from)} – ${fmt(to)}`;
  if (from !== undefined) return `${fmt(from)}+`;
  if (to !== undefined) return `Up to ${fmt(to)}`;
  return 'All';
}

export async function searchProducts(params: SearchParams): Promise<SearchResult> {
  const { text, categoryId, locale, currency, country, sort, selections = {}, withFacets = true } = params;
  const limit = params.limit ?? 24;
  const offset = params.offset ?? 0;

  const must: _SearchQuery[] = [];
  if (text && text.trim()) {
    must.push({ fullText: { field: 'name', language: locale, value: text.trim() } } as _SearchQuery);
  }
  if (categoryId) {
    must.push({ exact: { field: 'categoriesSubTree', value: categoryId } } as _SearchQuery);
  }

  let facetExpr;
  let meta: Record<string, FacetMeta> = {};
  if (withFacets) {
    const attrs = await getSearchableAttributes();
    const built = buildFacets(attrs, locale);
    facetExpr = built.facets;
    meta = built.meta;
  }

  const postFilter = buildPostFilter(selections, meta, locale);

  const query: _SearchQuery | undefined =
    must.length === 0 ? undefined : must.length === 1 ? must[0] : { and: must };

  const request: ProductSearchRequest = {
    ...(query ? { query } : {}),
    ...(postFilter ? { postFilter } : {}),
    ...(facetExpr ? { facets: facetExpr } : {}),
    ...(buildSort(sort, locale) ? { sort: buildSort(sort, locale) } : {}),
    productProjectionParameters: {
      priceCurrency: currency,
      priceCountry: country,
      localeProjection: [locale],
      expand: ['masterVariant.price.discounted.discount', 'variants[*].price.discounted.discount'],
    },
    markMatchingVariants: Object.keys(selections).length > 0,
    limit,
    offset,
  };

  const { body } = await apiRoot.products().search().post({ body: request }).execute();

  const products = body.results
    .map((r) => r.productProjection)
    .filter((p): p is ProductProjection => !!p)
    .map((p) => mapProduct(p, locale));

  return {
    products,
    total: body.total ?? 0,
    offset: body.offset ?? offset,
    limit: body.limit ?? limit,
    facets: mapFacetResults(body.facets, meta, locale),
  };
}

export async function getProductBySku(
  sku: string,
  locale: string,
  currency: string,
  country: string
): Promise<Product | null> {
  const { body } = await apiRoot
    .products()
    .search()
    .post({
      body: {
        query: { exact: { field: 'variants.sku', value: sku } } as ProductSearchRequest['query'],
        productProjectionParameters: {
          priceCurrency: currency,
          priceCountry: country,
          localeProjection: [locale],
          expand: ['masterVariant.price.discounted.discount', 'variants[*].price.discounted.discount'],
        },
        limit: 1,
      },
    })
    .execute();
  const projection = body.results[0]?.productProjection;
  return projection ? mapProduct(projection, locale) : null;
}
