'use client';
import { useState } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { Input, Select } from '@/components/ui';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export function PlpToolbar({ initialQuery, initialSort }: { initialQuery: string; initialSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQuery);

  function navigate(next: { q?: string; sort?: string }) {
    const params = new URLSearchParams();
    const query = next.q ?? q;
    const sort = next.sort ?? initialSort;
    if (query) params.set('q', query);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    router.push((qs ? `${pathname}?${qs}` : pathname) as `/${string}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q });
        }}
        className="sm:max-w-xs sm:flex-1"
      >
        <Input
          type="search"
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search products"
        />
      </form>
      <div className="sm:w-48">
        <Select
          value={initialSort}
          onChange={(e) => navigate({ sort: e.target.value })}
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
