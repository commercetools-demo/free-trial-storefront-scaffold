import { Link } from '@/i18n/routing';
import { SparkleIcon } from '@/components/ui/icons';
import type { Category } from '@/lib/types';

export default function Footer({ categoryTree }: { categoryTree: Category[] }) {
  return (
    <footer className="mt-24 bg-ink text-cloud">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="text-3xl font-black">
              <span className="text-gradient">LUMINA</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-cloud/60">
              Fashion that glows. Vibrant pieces designed to be seen.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-cloud/50">Shop</h3>
            <ul className="space-y-2 text-sm text-cloud/80">
              {categoryTree.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="hover:text-magenta">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-cloud/50">Help</h3>
            <ul className="space-y-2 text-sm text-cloud/80">
              <li><Link href="/account" className="hover:text-magenta">My Account</Link></li>
              <li><Link href="/wishlists" className="hover:text-magenta">Wishlist</Link></li>
              <li><Link href="/cart" className="hover:text-magenta">Cart</Link></li>
              <li><Link href="/search" className="hover:text-magenta">Search</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cloud/50">
              <SparkleIcon width={16} height={16} /> Get the glow
            </h3>
            <p className="text-sm text-cloud/60">Join for early drops and 15% off your first order.</p>
            <form className="mt-3 flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-full bg-white/10 px-4 py-2.5 text-sm placeholder:text-cloud/40 focus:outline-none focus:ring-2 focus:ring-magenta/50"
              />
              <button
                type="submit"
                className="rounded-full bg-aurora px-5 py-2.5 text-sm font-semibold text-white"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-cloud/40">
          © {new Date().getFullYear()} LUMINA. Built on commercetools. A demo storefront.
        </div>
      </div>
    </footer>
  );
}
