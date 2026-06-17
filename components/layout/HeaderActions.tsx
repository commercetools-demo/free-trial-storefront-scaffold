'use client';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { useCartContext } from '@/context/CartProvider';
import { useWishlist } from '@/hooks/useWishlist';
import { useAccount, useAuthActions } from '@/hooks/useAccount';

function IconButton({
  label,
  onClick,
  badge,
  children,
}: {
  label: string;
  onClick?: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} aria-label={label} className="relative text-charcoal hover:text-terra">
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-terra px-1 text-[10px] font-medium text-cream">
          {badge}
        </span>
      )}
    </button>
  );
}

export function HeaderActions() {
  const { cart, openMiniCart } = useCartContext();
  const { totalItems } = useWishlist();
  const { user } = useAccount();
  const { logout } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('nav');

  const cartCount = cart?.totalLineItemQuantity ?? 0;

  return (
    <div className="flex items-center gap-4">
      {/* Account */}
      {user ? (
        <div className="group relative">
          <button aria-label={t('account')} className="text-charcoal hover:text-terra">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </button>
          <div className="absolute right-0 top-full z-40 hidden min-w-44 border border-border bg-cream p-2 shadow-lg group-hover:block">
            <p className="px-3 py-1.5 text-xs text-charcoal-light">{t('greeting', { name: user.firstName ?? user.email })}</p>
            <Link href="/account" className="block px-3 py-1.5 text-sm text-charcoal hover:bg-cream-dark">{t('account')}</Link>
            <Link href="/account/orders" className="block px-3 py-1.5 text-sm text-charcoal hover:bg-cream-dark">{t('orders')}</Link>
            <Link href="/wishlists" className="block px-3 py-1.5 text-sm text-charcoal hover:bg-cream-dark">{t('wishlists')}</Link>
            <button
              onClick={async () => { await logout(); router.push('/'); }}
              className="block w-full px-3 py-1.5 text-left text-sm text-charcoal hover:bg-cream-dark"
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      ) : (
        <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} aria-label={t('signIn')} className="text-charcoal hover:text-terra">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </Link>
      )}

      {/* Wishlist */}
      <Link href="/wishlists" aria-label={t('wishlist')} className="relative text-charcoal hover:text-terra">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-terra px-1 text-[10px] font-medium text-cream">
            {totalItems}
          </span>
        )}
      </Link>

      {/* Cart */}
      <IconButton label={t('cart')} onClick={openMiniCart} badge={cartCount}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
        </svg>
      </IconButton>
    </div>
  );
}
