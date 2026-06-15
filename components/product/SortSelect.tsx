'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

const OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'name-desc', label: 'Name: Z–A' },
];

export default function SortSelect() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('sort') ?? '';

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set('sort', e.target.value);
    else params.delete('sort');
    params.delete('offset');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={onChange}
      aria-label="Sort products"
      className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet/40"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
