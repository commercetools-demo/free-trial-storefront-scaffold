import { Link } from '@/i18n/routing';
import type { Category } from '@/lib/types';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { SearchBar } from './SearchBar';
import { HeaderActions } from './HeaderActions';
import { CountrySwitcher } from './CountrySwitcher';

// Server component: receives the server-fetched category tree as a prop.
export function Header({ categoryTree }: { categoryTree: Category[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-4 px-4 py-1.5 text-xs">
        <CountrySwitcher />
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <MobileMenu categoryTree={categoryTree} />
        <Link href="/" className="text-xl font-semibold tracking-tight text-charcoal">
          My Brand
        </Link>
        <div className="ml-2 hidden flex-1 md:block">
          <MegaMenu categoryTree={categoryTree} />
        </div>
        <div className="hidden flex-1 lg:block lg:max-w-sm">
          <SearchBar />
        </div>
        <div className="ml-auto">
          <HeaderActions />
        </div>
      </div>
      <div className="border-t border-border px-4 py-2 lg:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
