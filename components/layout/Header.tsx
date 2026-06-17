'use client';
import { Link, useRouter } from '@/i18n/routing';
import { useAccount, useAuthMutations } from '@/hooks/useAccount';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import { useCartSWR } from '@/hooks/useCart';
import { Button } from '@/components/ui';

function BusinessUnitSwitcher() {
  const { businessUnits, currentBusinessUnit, currentStore, selectBusinessUnit, selectStore } = useBusinessUnit();
  if (businessUnits.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <select
        value={currentBusinessUnit?.id ?? ''}
        onChange={(e) => selectBusinessUnit(e.target.value)}
        className="rounded-md border border-border bg-white px-2 py-1 text-xs"
        aria-label="Business unit"
      >
        {businessUnits.map((bu) => (
          <option key={bu.id} value={bu.id}>
            {bu.name}
          </option>
        ))}
      </select>
      {currentBusinessUnit && currentBusinessUnit.stores.length > 1 && (
        <select
          value={currentStore?.key ?? ''}
          onChange={(e) => selectStore(e.target.value)}
          className="rounded-md border border-border bg-white px-2 py-1 text-xs"
          aria-label="Store"
        >
          {currentBusinessUnit.stores.map((s) => (
            <option key={s.key} value={s.key}>
              {s.name ?? s.key}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function Header() {
  const { user } = useAccount();
  const { logout } = useAuthMutations();
  const { data: cart } = useCartSWR();
  const router = useRouter();
  const itemCount = cart?.itemCount ?? 0;

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-charcoal">
            B2B&nbsp;Store
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link href="/products" className="text-charcoal-light hover:text-charcoal">
              Products
            </Link>
            {user && (
              <Link href="/dashboard" className="text-charcoal-light hover:text-charcoal">
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && <BusinessUnitSwitcher />}
          <Link href="/cart" className="relative text-sm text-charcoal-light hover:text-charcoal">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-terra px-1.5 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-charcoal-light sm:inline">
                {user.firstName || user.email}
              </span>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
