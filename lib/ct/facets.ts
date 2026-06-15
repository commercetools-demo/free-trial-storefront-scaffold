import 'server-only';
import { unstable_cache } from 'next/cache';
import type {
  AttributeDefinition,
  AttributeType,
  ProductSearchFacetExpression,
  SearchFieldType,
  _SearchQuery,
} from '@commercetools/platform-sdk';
import { apiRoot } from './client';

export interface FacetMeta {
  name: string;
  label: string;
  field: string;
  fieldType: SearchFieldType;
  kind: 'distinct' | 'ranges';
}

const RANGE_TYPES = new Set(['number', 'money', 'date', 'datetime', 'time']);

/** Fetch + flatten + dedupe searchable attribute definitions from all product types. */
async function fetchSearchableAttributes(): Promise<AttributeDefinition[]> {
  const { body } = await apiRoot.productTypes().get({ queryArgs: { limit: 100 } }).execute();
  const seen = new Set<string>();
  const out: AttributeDefinition[] = [];
  for (const pt of body.results) {
    for (const attr of pt.attributes ?? []) {
      if (!attr.isSearchable) continue;
      const typeName = attr.type.name;
      if (typeName === 'reference' || typeName === 'nested') continue;
      if (seen.has(attr.name)) continue;
      seen.add(attr.name);
      out.push(attr);
    }
  }
  return out;
}

export async function getSearchableAttributes(): Promise<AttributeDefinition[]> {
  return unstable_cache(fetchSearchableAttributes, ['searchable-attributes'], {
    revalidate: 3600,
    tags: ['product-types'],
  })();
}

/** Resolve the effective field path + fieldType for an attribute. */
function resolveField(attr: AttributeDefinition): {
  field: string;
  fieldType: SearchFieldType;
  kind: 'distinct' | 'ranges';
} {
  let typeName: string = attr.type.name;
  let isSet = false;
  if (typeName === 'set') {
    isSet = true;
    typeName = (attr.type as Extract<AttributeType, { name: 'set' }>).elementType.name;
  }

  const base = `variants.attributes.${attr.name}`;

  // enum / lenum are queried by their .key subfield, fieldType 'enum'
  if (typeName === 'enum' || typeName === 'lenum') {
    return {
      field: `${base}.key`,
      fieldType: (isSet ? 'set_enum' : 'enum') as SearchFieldType,
      kind: 'distinct',
    };
  }

  const effectiveType = (isSet ? `set_${typeName}` : typeName) as SearchFieldType;
  const kind = RANGE_TYPES.has(typeName) ? 'ranges' : 'distinct';
  return { field: base, fieldType: effectiveType, kind };
}

function labelFor(attr: AttributeDefinition, locale: string): string {
  const label = attr.label as Record<string, string> | undefined;
  return label?.[locale] ?? label?.[locale.split('-')[0]] ?? attr.name;
}

/**
 * Build facet expressions for the search request plus a metadata map keyed by
 * facet name (used later to build the postFilter from URL selections).
 */
export function buildFacets(
  attributes: AttributeDefinition[],
  locale: string,
): { expressions: ProductSearchFacetExpression[]; metas: Record<string, FacetMeta> } {
  const expressions: ProductSearchFacetExpression[] = [];
  const metas: Record<string, FacetMeta> = {};

  // Always-present: Stock + Price (first)
  metas['isOnStock'] = {
    name: 'isOnStock',
    label: 'Availability',
    field: 'variants.availability.isOnStock',
    fieldType: 'boolean',
    kind: 'distinct',
  };
  expressions.push({
    distinct: {
      name: 'isOnStock',
      field: 'variants.availability.isOnStock',
      fieldType: 'boolean',
      language: locale,
    },
  });

  metas['price'] = {
    name: 'price',
    label: 'Price',
    field: 'variants.prices.centAmount',
    fieldType: 'number',
    kind: 'ranges',
  };
  expressions.push({
    ranges: {
      name: 'price',
      field: 'variants.prices.centAmount',
      fieldType: 'number',
      ranges: [
        { from: 0, to: 2500 },
        { from: 2500, to: 5000 },
        { from: 5000, to: 10000 },
        { from: 10000, to: 20000 },
        { from: 20000 },
      ],
    },
  });

  for (const attr of attributes) {
    const { field, fieldType, kind } = resolveField(attr);
    const name = attr.name;
    metas[name] = { name, label: labelFor(attr, locale), field, fieldType, kind };
    if (kind === 'distinct') {
      expressions.push({ distinct: { name, field, fieldType, language: locale, limit: 50 } });
    } else {
      expressions.push({
        ranges: { name, field, fieldType, ranges: [{ from: 0 }] },
      });
    }
  }

  return { expressions, metas };
}

function parseRangeKey(key: string): { gte?: number; lte?: number } {
  // key format: "<from>-<to>", "*" for open-ended bounds
  const [from, to] = key.split('-');
  const out: { gte?: number; lte?: number } = {};
  if (from && from !== '*') out.gte = Number(from);
  if (to && to !== '*') out.lte = Number(to);
  return out;
}

/** Translate active f_* selections (Record<name, value>) into a commercetools postFilter. */
export function buildPostFilter(
  metas: Record<string, FacetMeta>,
  selections: Record<string, string>,
  language: string,
): _SearchQuery | undefined {
  const clauses: _SearchQuery[] = [];

  for (const [name, raw] of Object.entries(selections)) {
    const meta = metas[name];
    if (!meta || !raw) continue;

    if (meta.kind === 'distinct') {
      const values = raw.split(',').filter(Boolean);
      const exacts: _SearchQuery[] = values.map((v) => {
        let value: string | boolean = v;
        if (meta.fieldType === 'boolean') value = v === 'true';
        return {
          exact: {
            field: meta.field,
            fieldType: meta.fieldType,
            language,
            value,
          },
        } as _SearchQuery;
      });
      if (exacts.length === 1) clauses.push(exacts[0]);
      else if (exacts.length > 1) clauses.push({ or: exacts } as _SearchQuery);
    } else {
      // ranges (single-select)
      const { gte, lte } = parseRangeKey(raw);
      clauses.push({
        range: {
          field: meta.field,
          fieldType: meta.fieldType,
          ...(gte !== undefined ? { gte } : {}),
          ...(lte !== undefined ? { lte } : {}),
        },
      } as _SearchQuery);
    }
  }

  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return { and: clauses } as _SearchQuery;
}
