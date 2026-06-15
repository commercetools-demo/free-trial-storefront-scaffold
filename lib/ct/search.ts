import 'server-only';
import type {
  ProductSearchRequest,
  ProductSearchFacetResultBucket,
  ProductProjection,
  SearchSorting,
  _SearchQuery,
} from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import { mapProduct } from '@/lib/mappers/product';
import { getSearchableAttributes, buildFacets, buildPostFilter } from './facets';
import type { Product, ProductSearchResponse, SearchFacet } from '@/lib/types';

export interface SearchParams {
  text?: string;
  categoryId?: string;
  locale: string;
  currency: string;
  country: string;
  limit?: number;
  offset?: number;
  sort?: string;
  filters?: Record<string, string>;
  withFacets?: boolean;
}

function buildSort(sort: string | undefined, locale: string): SearchSorting[] | undefined {
  switch (sort) {
    case 'price-asc':
      return [{ field: 'variants.prices.centAmount', order: 'asc' }];
    case 'price-desc':
      return [{ field: 'variants.prices.centAmount', order: 'desc' }];
    case 'name-asc':
      return [{ field: 'name', language: locale, order: 'asc' }];
    case 'name-desc':
      return [{ field: 'name', language: locale, order: 'desc' }];
    case 'newest':
      return [{ field: 'createdAt', order: 'desc' }];
    default:
      return undefined;
  }
}

function boolLabel(name: string, key: string): string | undefined {
  if (name === 'isOnStock') return key === 'true' ? 'In stock' : 'Out of stock';
  return undefined;
}

export async function searchProducts(params: SearchParams): Promise<ProductSearchResponse> {
  const {
    text,
    categoryId,
    locale,
    currency,
    country,
    limit = 24,
    offset = 0,
    sort,
    filters = {},
    withFacets = true,
  } = params;

  // Build the base query (text and/or category). Omitting it matches all products.
  const andClauses: _SearchQuery[] = [];
  if (text) {
    andClauses.push({ fullText: { field: 'name', language: locale, value: text } } as _SearchQuery);
  }
  if (categoryId) {
    andClauses.push({ exact: { field: 'categoriesSubTree', value: categoryId } } as _SearchQuery);
  }
  const query: _SearchQuery | undefined =
    andClauses.length === 0 ? undefined : andClauses.length === 1 ? andClauses[0] : { and: andClauses };

  // Facets + postFilter from product-type schema and URL selections
  let facetExpressions;
  let metas;
  if (withFacets) {
    const attributes = await getSearchableAttributes();
    const built = buildFacets(attributes, locale);
    facetExpressions = built.expressions;
    metas = built.metas;
  }
  const postFilter = metas ? buildPostFilter(metas, filters, locale) : undefined;

  const request: ProductSearchRequest = {
    ...(query ? { query } : {}),
    sort: buildSort(sort, locale),
    limit,
    offset,
    markMatchingVariants: true,
    facets: facetExpressions,
    postFilter,
    productProjectionParameters: {
      priceCurrency: currency,
      priceCountry: country,
      localeProjection: [locale],
      expand: [
        'masterVariant.price.discounted.discount',
        'variants[*].price.discounted.discount',
      ],
    },
  };

  const { body } = await apiRoot.products().search().post({ body: request }).execute();

  const products: Product[] = body.results
    .map((r) => r.productProjection)
    .filter((p): p is ProductProjection => Boolean(p))
    .map((p) => mapProduct(p, locale));

  const facets: SearchFacet[] = [];
  if (metas && body.facets) {
    for (const fr of body.facets) {
      const meta = metas[fr.name];
      if (!meta) continue;
      const bucketResult = fr as ProductSearchFacetResultBucket;
      const buckets = (bucketResult.buckets ?? [])
        .filter((b) => b.count > 0)
        .map((b) => ({ key: b.key, count: b.count, label: boolLabel(fr.name, b.key) }));
      if (buckets.length === 0) continue;
      facets.push({
        name: meta.name,
        label: meta.label,
        kind: meta.kind,
        field: meta.field,
        fieldType: meta.fieldType,
        buckets,
      });
    }
  }

  return {
    products,
    total: body.total ?? products.length,
    offset: body.offset ?? offset,
    limit: body.limit ?? limit,
    facets,
  };
}

export async function getProductBySku(
  sku: string,
  locale: string,
  currency: string,
  country: string,
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
          expand: [
            'masterVariant.price.discounted.discount',
            'variants[*].price.discounted.discount',
          ],
        },
        limit: 1,
      },
    })
    .execute();
  const projection = body.results[0]?.productProjection;
  return projection ? mapProduct(projection, locale) : null;
}

export async function getProductById(
  id: string,
  locale: string,
  currency: string,
  country: string,
): Promise<Product | null> {
  try {
    const { body } = await apiRoot
      .productProjections()
      .withId({ ID: id })
      .get({ queryArgs: { priceCurrency: currency, priceCountry: country } })
      .execute();
    return mapProduct(body, locale);
  } catch {
    return null;
  }
}

/** Attribute display labels keyed by attribute name, for the active locale. */
export async function getAttributeLabels(locale: string): Promise<Record<string, string>> {
  try {
    const attributes = await getSearchableAttributes();
    const out: Record<string, string> = {};
    for (const attr of attributes) {
      const label = attr.label as Record<string, string> | undefined;
      out[attr.name] = label?.[locale] ?? label?.[locale.split('-')[0]] ?? attr.name;
    }
    return out;
  } catch {
    return {};
  }
}
