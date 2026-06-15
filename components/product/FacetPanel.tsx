'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { formatCentAmount } from '@/lib/utils';
import type { SearchFacet } from '@/lib/types';

export default function FacetPanel({ facets }: { facets: SearchFacet[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, currency } = useLocale();

  const getSelection = useCallback(
    (name: string) => {
      const raw = searchParams.get(`f_${name}`);
      return raw ? raw.split(',').filter(Boolean) : [];
    },
    [searchParams],
  );

  const update = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete('offset');
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  function toggleDistinct(name: string, value: string) {
    const current = getSelection(name);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update((p) => (next.length ? p.set(`f_${name}`, next.join(',')) : p.delete(`f_${name}`)));
  }

  function selectRange(name: string, key: string) {
    const isActive = getSelection(name)[0] === key;
    update((p) => (isActive ? p.delete(`f_${name}`) : p.set(`f_${name}`, key)));
  }

  function clearAll() {
    update((p) => {
      [...p.keys()].forEach((k) => k.startsWith('f_') && p.delete(k));
    });
  }

  function rangeLabel(key: string): string {
    const [from, to] = key.split('-');
    const f = from && from !== '*' ? formatCentAmount(Number(from), currency, locale) : null;
    const t = to && to !== '*' ? formatCentAmount(Number(to), currency, locale) : null;
    if (f && t) return `${f} – ${t}`;
    if (f && !t) return `${f}+`;
    if (!f && t) return `Under ${t}`;
    return key;
  }

  const activeCount = [...searchParams.keys()].filter((k) => k.startsWith('f_')).length;
  const visible = facets.filter((f) => f.buckets.length > 0);

  if (visible.length === 0) return null;

  return (
    <div className="space-y-6">
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-sm font-semibold text-magenta hover:underline"
        >
          Clear all filters ({activeCount})
        </button>
      )}

      {visible.map((facet) => {
        const selected = getSelection(facet.name);
        return (
          <div key={facet.name} className="border-b border-border pb-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">
              {facet.label}
            </h3>
            <div className="space-y-1.5">
              {facet.buckets.slice(0, 12).map((b) => {
                const checked =
                  facet.kind === 'ranges' ? selected[0] === b.key : selected.includes(b.key);
                const label =
                  facet.name === 'price'
                    ? rangeLabel(b.key)
                    : b.label ?? b.key;
                return (
                  <label
                    key={b.key}
                    className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft hover:text-violet"
                  >
                    <input
                      type={facet.kind === 'ranges' ? 'radio' : 'checkbox'}
                      checked={checked}
                      onChange={() =>
                        facet.kind === 'ranges'
                          ? selectRange(facet.name, b.key)
                          : toggleDistinct(facet.name, b.key)
                      }
                      className="h-4 w-4 accent-violet"
                    />
                    <span className="flex-1">{label}</span>
                    <span className="text-xs text-ink/40">{b.count}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
