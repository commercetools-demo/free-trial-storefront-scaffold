'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { SearchIcon } from '@/components/ui/icons';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" width={18} height={18} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for glow…"
        aria-label="Search products"
        className="w-full rounded-full border border-border bg-mist/60 py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet/40"
      />
    </form>
  );
}
