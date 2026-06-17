import 'server-only';
import { unstable_cache } from 'next/cache';
import type {
  AttributeDefinition,
  AttributeType,
  ProductSearchFacetExpression,
  ProductSearchFacetResultBucketEntry,
  _SearchQuery,
} from '@commercetools/platform-sdk';
import { apiRoot } from './client';

export type FacetFieldType = 'boolean' | 'text' | 'ltext' | 'enum' | 'number' | 'money' | string;

export interface FacetMeta {
  name: string;
  field: string;
  fieldType: FacetFieldType;
  kind: 'distinct' | 'ranges';
  language?: string;
}

const RANGE_TYPES = new Set(['number', 'money', 'date', 'datetime', 'time']);
const SKIP_TYPES = new Set(['reference', 'nested']);
const MAX_ATTRIBUTE_FACETS = 18;

function innerTypeName(t: AttributeType): string {
  if (t.name === 'set' && 'elementType' in t && t.elementType) {
    return `set_${t.elementType.name}`;
  }
  return t.name;
}

async function fetchSearchableAttributes(): Promise<AttributeDefinition[]> {
  const { body } = await apiRoot.productTypes().get({ queryArgs: { limit: 100 } }).execute();
  const seen = new Set<string>();
  const out: AttributeDefinition[] = [];
  for (const pt of body.results) {
    for (const attr of pt.attributes ?? []) {
      if (!attr.isSearchable) continue;
      if (seen.has(attr.name)) continue;
      const base = attr.type.name === 'set' && 'elementType' in attr.type ? attr.type.elementType!.name : attr.type.name;
      if (SKIP_TYPES.has(base)) continue;
      seen.add(attr.name);
      out.push(attr);
    }
  }
  return out;
}

export const getSearchableAttributes = unstable_cache(
  fetchSearchableAttributes,
  ['searchable-attributes'],
  { revalidate: 3600 }
);

/** Build the facet expressions + a metadata map for translating selections back to a postFilter. */
export function buildFacets(
  attrs: AttributeDefinition[],
  locale: string
): { facets: ProductSearchFacetExpression[]; meta: Record<string, FacetMeta> } {
  const facets: ProductSearchFacetExpression[] = [];
  const meta: Record<string, FacetMeta> = {};

  // Always-present: stock + price
  facets.push({
    distinct: { name: 'isOnStock', field: 'variants.availability.isOnStock', fieldType: 'boolean', language: locale },
  } as ProductSearchFacetExpression);
  meta['isOnStock'] = { name: 'isOnStock', field: 'variants.availability.isOnStock', fieldType: 'boolean', kind: 'distinct', language: locale };

  facets.push({
    ranges: {
      name: 'price',
      field: 'variants.prices.centAmount',
      fieldType: 'number',
      ranges: [{ from: 0, to: 2500 }, { from: 2500, to: 5000 }, { from: 5000, to: 10000 }, { from: 10000, to: 25000 }, { from: 25000 }],
    },
  } as ProductSearchFacetExpression);
  meta['price'] = { name: 'price', field: 'variants.prices.centAmount', fieldType: 'number', kind: 'ranges' };

  let count = 0;
  for (const attr of attrs) {
    if (count >= MAX_ATTRIBUTE_FACETS) break;
    const inner = innerTypeName(attr.type);
    const isRange = RANGE_TYPES.has(inner.replace('set_', ''));
    const isEnumLike = inner === 'enum' || inner === 'lenum' || inner === 'set_enum' || inner === 'set_lenum';

    if (isRange) {
      const field = `variants.attributes.${attr.name}`;
      facets.push({
        ranges: { name: attr.name, field, fieldType: inner, ranges: [{ from: 0 }] },
      } as ProductSearchFacetExpression);
      meta[attr.name] = { name: attr.name, field, fieldType: inner, kind: 'ranges' };
    } else {
      const isSet = inner.startsWith('set_');
      const fieldType = isEnumLike ? (isSet ? 'set_enum' : 'enum') : inner;
      const field = isEnumLike ? `variants.attributes.${attr.name}.key` : `variants.attributes.${attr.name}`;
      facets.push({
        distinct: { name: attr.name, field, fieldType, language: locale },
      } as ProductSearchFacetExpression);
      meta[attr.name] = { name: attr.name, field, fieldType, kind: 'distinct', language: locale };
    }
    count++;
  }

  return { facets, meta };
}

/** Translate `f_*` URL selections into a commercetools postFilter query. */
export function buildPostFilter(
  selections: Record<string, string>,
  meta: Record<string, FacetMeta>,
  locale: string
): _SearchQuery | undefined {
  const clauses: _SearchQuery[] = [];

  for (const [name, raw] of Object.entries(selections)) {
    const m = meta[name];
    if (!m || !raw) continue;
    const values = raw.split(',').filter(Boolean);
    if (values.length === 0) continue;

    if (m.kind === 'ranges') {
      const rangeClauses = values.map((v) => parseRange(v, m)).filter(Boolean) as _SearchQuery[];
      if (rangeClauses.length === 1) clauses.push(rangeClauses[0]);
      else if (rangeClauses.length > 1) clauses.push({ or: rangeClauses });
    } else {
      const exacts = values.map((v) => exactClause(v, m, locale));
      if (exacts.length === 1) clauses.push(exacts[0]);
      else clauses.push({ or: exacts });
    }
  }

  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return { and: clauses };
}

function exactClause(value: string, m: FacetMeta, locale: string): _SearchQuery {
  const typedValue: unknown = m.fieldType === 'boolean' ? value === 'true' : value;
  const withLang = m.fieldType !== 'number' && m.fieldType !== 'boolean';
  return {
    exact: {
      field: m.field,
      value: typedValue,
      fieldType: m.fieldType,
      ...(withLang ? { language: locale } : {}),
    },
  } as unknown as _SearchQuery;
}

/** Parse the CT range-bucket key format: "<from>-<to>" with '*' for open-ended (floats). */
export function parseRangeKey(bucketKey: string): { gte?: number; lte?: number } | null {
  const [fromStr, toStr] = bucketKey.split('-');
  const from = fromStr === '*' || fromStr === '' ? undefined : Number(fromStr);
  const to = toStr === '*' || toStr === undefined ? undefined : Number(toStr);
  const out: { gte?: number; lte?: number } = {};
  if (from !== undefined && !Number.isNaN(from)) out.gte = from;
  if (to !== undefined && !Number.isNaN(to)) out.lte = to;
  return Object.keys(out).length ? out : null;
}

function parseRange(bucketKey: string, m: FacetMeta): _SearchQuery | null {
  const bounds = parseRangeKey(bucketKey);
  if (!bounds) return null;
  return { range: { field: m.field, fieldType: m.fieldType, ...bounds } } as unknown as _SearchQuery;
}

/** The bucket key is already the canonical range string (e.g. "0.0-2500.0"). */
export function rangeBucketKey(bucket: ProductSearchFacetResultBucketEntry): string {
  return bucket.key;
}
