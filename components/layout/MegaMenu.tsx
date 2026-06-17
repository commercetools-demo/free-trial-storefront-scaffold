'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Category } from '@/lib/types';

export function MegaMenu({ categoryTree }: { categoryTree: Category[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('nav');

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenId(null);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenId(null);
    }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const roots = categoryTree.filter((c) => c.slug);

  return (
    <nav ref={ref} className="hidden md:flex items-center gap-6" aria-label={t('categories')}>
      {roots.slice(0, 7).map((root) => {
        const children = (root.children ?? []).filter((c) => c.slug);
        const open = openId === root.id;
        return (
          <div
            key={root.id}
            className="relative"
            onMouseEnter={() => children.length > 0 && setOpenId(root.id)}
            onMouseLeave={() => setOpenId(null)}
          >
            <Link
              href={`/category/${root.slug}`}
              className="py-2 text-sm text-charcoal hover:text-terra"
              onClick={() => setOpenId(null)}
            >
              {root.name}
            </Link>
            {open && children.length > 0 && (
              <div className="absolute left-0 top-full z-40 min-w-56 border border-border bg-cream p-4 shadow-lg">
                <ul className="grid gap-1">
                  {children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/category/${child.slug}`}
                        className="block py-1.5 text-sm text-charcoal-light hover:text-terra"
                        onClick={() => setOpenId(null)}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
