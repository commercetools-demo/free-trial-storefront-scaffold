'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Category } from '@/lib/types';
import { SearchBar } from './SearchBar';

export function MobileMenu({ categoryTree }: { categoryTree: Category[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const roots = categoryTree.filter((c) => c.slug);
  const t = useTranslations('nav');

  return (
    <>
      <button
        className="md:hidden text-charcoal"
        aria-label={t('openMenu')}
        onClick={() => setOpen(true)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-charcoal/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-80 max-w-[85%] flex-col bg-cream shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="font-medium text-charcoal">{t('menu')}</span>
              <button onClick={() => setOpen(false)} aria-label={t('closeMenu')}>✕</button>
            </div>
            <div className="border-b border-border p-4">
              <SearchBar />
            </div>
            <ul className="flex-1 overflow-y-auto p-2">
              {roots.map((root) => {
                const children = (root.children ?? []).filter((c) => c.slug);
                return (
                  <li key={root.id} className="border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/category/${root.slug}`}
                        className="flex-1 py-3 px-2 text-sm text-charcoal"
                        onClick={() => setOpen(false)}
                      >
                        {root.name}
                      </Link>
                      {children.length > 0 && (
                        <button
                          className="px-3 py-3 text-charcoal-light"
                          onClick={() => setExpanded(expanded === root.id ? null : root.id)}
                          aria-label={t('expand')}
                        >
                          {expanded === root.id ? '−' : '+'}
                        </button>
                      )}
                    </div>
                    {expanded === root.id && (
                      <ul className="pb-2 pl-4">
                        {children.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/category/${c.slug}`}
                              className="block py-2 px-2 text-sm text-charcoal-light"
                              onClick={() => setOpen(false)}
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
