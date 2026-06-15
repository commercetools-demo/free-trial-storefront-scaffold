'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

export default function Pagination({
  total,
  limit,
  offset,
}: {
  total: number;
  limit: number;
  offset: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  if (totalPages <= 1) return null;

  function go(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', String((page - 1) * limit));
    router.push(`${pathname}?${params.toString()}`);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:border-violet"
      >
        Prev
      </button>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <span key={p} className="flex items-center gap-2">
            {prev && p - prev > 1 && <span className="text-ink/30">…</span>}
            <button
              onClick={() => go(p)}
              aria-current={p === currentPage}
              className={`h-10 w-10 rounded-full text-sm font-semibold ${
                p === currentPage ? 'bg-aurora text-white' : 'border border-border hover:border-violet'
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:border-violet"
      >
        Next
      </button>
    </nav>
  );
}
