'use client';

import { useState, useRef, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { ChevronDown } from '@/components/ui/icons';
import type { Category } from '@/lib/types';

export default function DesktopNav({ categoryTree }: { categoryTree: Category[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenId(null);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <nav ref={navRef} className="hidden md:flex items-center gap-1">
      {categoryTree.slice(0, 6).map((cat) => {
        const active = pathname.startsWith(`/category/${cat.slug}`);
        const hasChildren = cat.children.length > 0;
        return (
          <div
            key={cat.id}
            className="relative"
            onMouseEnter={() => hasChildren && setOpenId(cat.id)}
            onMouseLeave={() => setOpenId(null)}
          >
            <Link
              href={`/category/${cat.slug}`}
              className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold ${
                active ? 'text-violet' : 'text-ink hover:text-violet'
              }`}
            >
              {cat.name}
              {hasChildren && <ChevronDown className="opacity-60" />}
            </Link>

            {hasChildren && openId === cat.id && (
              <div className="absolute left-0 top-full pt-2">
                <div className="min-w-56 rounded-2xl border border-border bg-white p-3 shadow-xl animate-fade-up">
                  <div className="grid gap-1">
                    {cat.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.slug}`}
                        className="rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-mist hover:text-violet"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
