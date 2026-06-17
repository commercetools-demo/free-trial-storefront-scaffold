'use client';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

export function Pagination({
  total,
  limit,
  offset,
}: {
  total: number;
  limit: number;
  offset: number;
}) {
  const t = useTranslations('plp');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  if (totalPages <= 1) return null;

  function go(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    const newOffset = (page - 1) * limit;
    if (newOffset <= 0) params.delete('offset');
    else params.set('offset', String(newOffset));
    router.push(`${pathname}?${params.toString()}`);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label={t('pagination')}>
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 text-sm text-charcoal hover:bg-cream-dark rounded-sm disabled:opacity-30"
      >
        {t('prev')}
      </button>
      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const gap = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {gap && <span className="px-1 text-charcoal-light">…</span>}
            <button
              onClick={() => go(p)}
              aria-current={p === currentPage}
              className={`min-w-9 px-3 py-1.5 text-sm rounded-sm ${
                p === currentPage ? 'bg-charcoal text-cream' : 'text-charcoal hover:bg-cream-dark'
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1.5 text-sm text-charcoal hover:bg-cream-dark rounded-sm disabled:opacity-30"
      >
        {t('next')}
      </button>
    </nav>
  );
}
