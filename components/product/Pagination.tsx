import { Link } from '@/i18n/routing';

export function Pagination({
  total,
  limit,
  offset,
  baseParams,
}: {
  total: number;
  limit: number;
  offset: number;
  baseParams: Record<string, string>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  if (totalPages <= 1) return null;

  function href(page: number) {
    const params = new URLSearchParams(baseParams);
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    const qs = params.toString();
    return (qs ? `/products?${qs}` : '/products') as `/${string}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      {currentPage > 1 && (
        <Link href={href(currentPage - 1)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-cream-dark">
          Previous
        </Link>
      )}
      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const gap = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {gap && <span className="px-1 text-charcoal-light">…</span>}
            <Link
              href={href(p)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                p === currentPage ? 'bg-charcoal text-white' : 'border border-border hover:bg-cream-dark'
              }`}
            >
              {p}
            </Link>
          </span>
        );
      })}
      {currentPage < totalPages && (
        <Link href={href(currentPage + 1)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-cream-dark">
          Next
        </Link>
      )}
    </nav>
  );
}
