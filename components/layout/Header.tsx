import { Link } from '@/i18n/routing';
import type { Category } from '@/lib/types';
import DesktopNav from './DesktopNav';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';
import HeaderActions from './HeaderActions';

export default function Header({ categoryTree }: { categoryTree: Category[] }) {
  return (
    <header className="sticky top-0 z-40">
      {/* Flashy announcement marquee */}
      <div className="bg-aurora-animated text-white text-xs font-semibold overflow-hidden whitespace-nowrap py-2">
        <div className="animate-marquee inline-block">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="mx-6">
              ✦ FREE SHIPPING OVER $75 &nbsp;•&nbsp; NEW DROP: SUMMER GLOW &nbsp;•&nbsp; UP TO 40% OFF
              SELECT STYLES &nbsp;•&nbsp; STUDENT DISCOUNT 15% &nbsp;✦ FREE SHIPPING OVER $75
              &nbsp;•&nbsp; NEW DROP: SUMMER GLOW &nbsp;•&nbsp; UP TO 40% OFF SELECT STYLES
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-border bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <MobileMenu categoryTree={categoryTree} />

            <Link href="/" className="shrink-0 text-2xl font-black tracking-tight">
              <span className="text-gradient">LUMINA</span>
            </Link>

            <DesktopNav categoryTree={categoryTree} />

            <div className="ml-auto hidden md:block w-64 lg:w-80">
              <SearchBar />
            </div>

            <HeaderActions />
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  );
}
