'use client';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import type { FacetResult } from '@/lib/types';

export function FacetPanel({
  facets,
  labels,
}: {
  facets: FacetResult[];
  labels: Record<string, string>;
}) {
  const t = useTranslations('plp');

  function facetLabel(name: string): string {
    if (name === 'isOnStock') return t('availability');
    if (name === 'price') return t('price');
    return labels[name] ?? name.replace(/[-_]/g, ' ');
  }

  function bucketLabel(facetName: string, key: string, fallback: string): string {
    if (facetName === 'isOnStock') {
      if (key === 'true') return t('inStock');
      if (key === 'false') return t('outOfStock');
    }
    return fallback;
  }

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // current selections: { name: [values] }
  const selections: Record<string, string[]> = {};
  for (const [k, v] of searchParams.entries()) {
    if (k.startsWith('f_')) selections[k.slice(2)] = v.split(',').filter(Boolean);
  }

  function commit(next: Record<string, string[]>) {
    const params = new URLSearchParams(searchParams.toString());
    // clear existing f_ params
    for (const k of Array.from(params.keys())) if (k.startsWith('f_')) params.delete(k);
    for (const [name, values] of Object.entries(next)) {
      if (values.length) params.set(`f_${name}`, values.join(','));
    }
    params.delete('offset'); // reset paging on filter change
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleDistinct(name: string, key: string) {
    const cur = selections[name] ?? [];
    const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
    commit({ ...selections, [name]: next });
  }

  function selectRange(name: string, key: string) {
    const cur = selections[name] ?? [];
    const next = cur.includes(key) ? [] : [key]; // single-select toggle
    commit({ ...selections, [name]: next });
  }

  function clearOne(name: string, key: string) {
    const next = { ...selections, [name]: (selections[name] ?? []).filter((k) => k !== key) };
    commit(next);
  }

  function clearAll() {
    commit({});
  }

  const activeCount = Object.values(selections).reduce((s, v) => s + v.length, 0);
  const visible = facets.filter((f) => f.buckets.length > 0);

  return (
    <aside className="w-full">
      {activeCount > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-charcoal">{t('activeFilters')}</span>
            {activeCount > 1 && (
              <button onClick={clearAll} className="text-xs text-terra hover:underline">
                {t('clearAll')}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selections).flatMap(([name, values]) =>
              values.map((key) => {
                const facet = facets.find((f) => f.name === name);
                const bucket = facet?.buckets.find((b) => b.key === key);
                return (
                  <button
                    key={`${name}-${key}`}
                    onClick={() => clearOne(name, key)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-3 py-1 text-xs text-charcoal hover:bg-border"
                  >
                    {bucketLabel(name, key, bucket?.label ?? key)}
                    <span aria-hidden>×</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {visible.map((facet) => (
          <div key={facet.name} className="border-b border-border pb-6 last:border-b-0">
            <h3 className="mb-3 text-sm font-medium capitalize text-charcoal">
              {facetLabel(facet.name)}
            </h3>
            <ul className="space-y-2">
              {facet.buckets.map((b) => {
                const checked = (selections[facet.name] ?? []).includes(b.key);
                return (
                  <li key={b.key}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal-light hover:text-charcoal">
                      <input
                        type={facet.kind === 'ranges' ? 'radio' : 'checkbox'}
                        checked={checked}
                        onChange={() =>
                          facet.kind === 'ranges'
                            ? selectRange(facet.name, b.key)
                            : toggleDistinct(facet.name, b.key)
                        }
                        className="accent-charcoal"
                      />
                      <span className="flex-1">{bucketLabel(facet.name, b.key, b.label)}</span>
                      <span className="text-xs text-charcoal-light/70">{b.count}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
