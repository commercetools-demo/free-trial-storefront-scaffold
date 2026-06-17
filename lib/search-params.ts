export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Extract facet selections (f_*), sort, and offset from raw search params. */
export function parseSearchParams(sp: RawSearchParams, limit = 24) {
  const selections: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (k.startsWith('f_')) {
      const val = first(v);
      if (val) selections[k.slice(2)] = val;
    }
  }
  const sort = first(sp.sort);
  const offset = Math.max(0, Number(first(sp.offset) ?? 0) || 0);
  return { selections, sort, offset, limit };
}
