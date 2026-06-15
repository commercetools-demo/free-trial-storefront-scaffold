'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import Drawer from '@/components/ui/Drawer';
import { MenuIcon } from '@/components/ui/icons';
import LocaleSwitcher from './LocaleSwitcher';
import type { Category } from '@/lib/types';

export default function MobileMenu({ categoryTree }: { categoryTree: Category[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="md:hidden rounded-full p-2 hover:bg-mist"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Menu" position="left">
        <nav className="space-y-1">
          {categoryTree.map((cat) => (
            <div key={cat.id} className="border-b border-border/60 pb-2">
              <Link
                href={`/category/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="block py-2 font-semibold text-ink"
              >
                {cat.name}
              </Link>
              {cat.children.length > 0 && (
                <div className="ml-3 grid">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      onClick={() => setOpen(false)}
                      className="py-1.5 text-sm text-ink-soft hover:text-violet"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-6">
          <LocaleSwitcher />
        </div>
      </Drawer>
    </>
  );
}
