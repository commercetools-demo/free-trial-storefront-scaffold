'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export function SearchBar({ className = '' }: { className?: string }) {
  const [q, setQ] = useState('');
  const router = useRouter();
  const t = useTranslations('nav');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className={`flex items-center ${className}`} role="search">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
        className="w-full border border-border bg-cream px-3 py-2 text-sm text-charcoal rounded-l-sm focus:outline-none focus:ring-1 focus:ring-charcoal"
      />
      <button
        type="submit"
        aria-label={t('search')}
        className="border border-l-0 border-border bg-charcoal px-3 py-2 text-cream rounded-r-sm hover:bg-charcoal-light"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
