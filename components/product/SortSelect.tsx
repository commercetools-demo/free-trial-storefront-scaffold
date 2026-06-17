'use client';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

const OPTIONS = [
  { value: '' },
  { value: 'price-asc' },
  { value: 'price-desc' },
  { value: 'name-asc' },
  { value: 'name-desc' },
];

const LABEL_KEYS: Record<string, string> = {
  '': 'sortRelevance',
  'price-asc': 'sortPriceAsc',
  'price-desc': 'sortPriceDesc',
  'name-asc': 'sortNameAsc',
  'name-desc': 'sortNameDesc',
};

export function SortSelect() {
  const t = useTranslations('plp');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('sort') ?? '';

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('sort', value);
    else params.delete('sort');
    params.delete('offset');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-charcoal-light">
      <span className="sr-only md:not-sr-only">{t('sort')}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border rounded-sm bg-cream px-3 py-1.5 text-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {t(LABEL_KEYS[o.value])}
          </option>
        ))}
      </select>
    </label>
  );
}
