import type {
  ProductSearchRequest,
  ProductSearchProjectionParams,
  _SearchQuery,
  ProductProjection,
  ProductSearchFacetExpression,
} from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import { getStoreChannelData } from './stores';
import { mapProduct } from '@/lib/mappers/product';
import { COUNTRY_CONFIG, DEFAULT_LOCALE } from '@/lib/utils';
import type { Product, ProductSearchResult, Facet, SessionData } from '@/lib/types';

const PRODUCT_PROJECTION_EXPANDS = [
  'categories[*]',
  'masterVariant.prices[*].channel',
  'variants[*].prices[*].channel',
];

export interface FacetConfiguration {
  field: string;
  label?: string;
}

export interface ProductQuery {
  query?: string;
  categoryId?: string;
  filters?: Record<string, string[]>;
  facetConfigurations?: FacetConfiguration[];
  sort?: { field: string; order: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
  storeKey?: string;
}

interface Locale {
  locale: string;
  currency: string;
  country: string;
}

export class ProductApi {
  private session: Partial<SessionData>;

  constructor(session: Partial<SessionData>) {
    this.session = session;
  }

  private resolveLocale(): Locale {
    const key = this.session.locale ?? DEFAULT_LOCALE.locale;
    const cfg = COUNTRY_CONFIG[key] ?? DEFAULT_LOCALE;
    return {
      locale: this.session.locale ?? cfg.locale,
      currency: this.session.currency ?? cfg.currency,
      country: this.session.country ?? cfg.country,
    };
  }

  private buildProjectionParams(
    locale: Locale,
    distributionChannelId?: string,
    storeKey?: string,
    accountGroupIds?: string[]
  ): ProductSearchProjectionParams {
    return {
      priceCurrency: locale.currency,
      priceCountry: locale.country,
      expand: PRODUCT_PROJECTION_EXPANDS,
      ...(distributionChannelId ? { priceChannel: distributionChannelId } : {}),
      ...(storeKey ? { storeProjection: storeKey } : {}),
      ...(accountGroupIds?.length
        ? { priceCustomerGroupAssignments: accountGroupIds }
        : {}),
    };
  }

  private buildSearchQuery(query: ProductQuery, locale: Locale): _SearchQuery | undefined {
    const clauses: _SearchQuery[] = [];

    if (query.query) {
      clauses.push({
        fullText: { field: 'name', language: locale.locale, value: query.query },
      } as _SearchQuery);
    }
    if (query.categoryId) {
      clauses.push({
        exact: { field: 'categories', value: query.categoryId },
      } as _SearchQuery);
    }
    for (const [field, values] of Object.entries(query.filters ?? {})) {
      if (!values.length) continue;
      clauses.push({
        or: values.map((value) => ({
          exact: { field: `variants.attributes.${field}`, value },
        })),
      } as _SearchQuery);
    }

    if (clauses.length === 0) return undefined;
    if (clauses.length === 1) return clauses[0];
    return { and: clauses } as _SearchQuery;
  }

  private buildFacets(query: ProductQuery): ProductSearchFacetExpression[] | undefined {
    if (!query.facetConfigurations?.length) return undefined;
    return query.facetConfigurations.map((f) => ({
      distinct: {
        name: f.field,
        field: `variants.attributes.${f.field}`,
        level: 'variants',
        limit: 50,
      },
    })) as ProductSearchFacetExpression[];
  }

  async query(query: ProductQuery): Promise<ProductSearchResult> {
    const locale = this.resolveLocale();
    const storeKey = query.storeKey ?? this.session.storeKey;

    const body: ProductSearchRequest = {
      query: this.buildSearchQuery(query, locale),
      productProjectionParameters: this.buildProjectionParams(
        locale,
        this.session.distributionChannelId,
        storeKey,
        this.session.accountGroupIds
      ),
      markMatchingVariants: true,
      limit: query.limit ?? 24,
      offset: query.offset ?? 0,
      ...(query.sort ? { sort: [{ field: query.sort.field, order: query.sort.order }] } : {}),
      ...(this.buildFacets(query) ? { facets: this.buildFacets(query) } : {}),
    } as ProductSearchRequest;

    const { body: res } = await apiRoot.products().search().post({ body }).execute();

    const products: Product[] = (res.results ?? []).map((r) => {
      const matched = r.matchingVariants?.matchedVariants?.length
        ? new Set(r.matchingVariants.matchedVariants.map((m) => m.id))
        : null;
      return mapProduct(
        r.productProjection as ProductProjection,
        matched,
        locale.locale,
        this.session.supplyChannelId
      );
    });

    return {
      products,
      total: res.total ?? 0,
      offset: res.offset ?? 0,
      limit: res.limit ?? products.length,
      facets: mapFacets(res.facets),
    };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const locale = this.resolveLocale();
    const storeKey = this.session.storeKey;
    const body: ProductSearchRequest = {
      query: {
        exact: { field: 'slug', language: locale.locale, value: slug },
      } as _SearchQuery,
      productProjectionParameters: this.buildProjectionParams(
        locale,
        this.session.distributionChannelId,
        storeKey,
        this.session.accountGroupIds
      ),
      limit: 1,
    } as ProductSearchRequest;

    const { body: res } = await apiRoot.products().search().post({ body }).execute();
    const first = res.results?.[0];
    if (!first?.productProjection) return null;
    return mapProduct(first.productProjection as ProductProjection, null, locale.locale, this.session.supplyChannelId);
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    const locale = this.resolveLocale();
    const body: ProductSearchRequest = {
      query: { exact: { field: 'variants.sku', value: sku } } as _SearchQuery,
      productProjectionParameters: this.buildProjectionParams(
        locale,
        this.session.distributionChannelId,
        this.session.storeKey,
        this.session.accountGroupIds
      ),
      limit: 1,
    } as ProductSearchRequest;
    const { body: res } = await apiRoot.products().search().post({ body }).execute();
    const first = res.results?.[0];
    if (!first?.productProjection) return null;
    return mapProduct(first.productProjection as ProductProjection, null, locale.locale, this.session.supplyChannelId);
  }
}

function mapFacets(ctFacets: unknown): Facet[] {
  if (!ctFacets || typeof ctFacets !== 'object') return [];
  const out: Facet[] = [];
  for (const [name, value] of Object.entries(ctFacets as Record<string, any>)) {
    const buckets = value?.buckets ?? value?.terms ?? [];
    if (!Array.isArray(buckets)) continue;
    out.push({
      field: name,
      label: name,
      type: 'terms',
      terms: buckets.map((b: any) => ({ term: String(b.key ?? b.term), count: b.count ?? 0 })),
    });
  }
  return out;
}
