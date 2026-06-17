import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { AccountGuard } from '@/components/auth/AccountGuard';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('account');
  return (
    <AccountGuard>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-semibold text-charcoal">{t('title')}</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
          <nav className="flex flex-row gap-2 md:flex-col">
            <Link href="/account" className="rounded-sm px-3 py-2 text-sm text-charcoal hover:bg-cream-dark">{t('profile')}</Link>
            <Link href="/account/orders" className="rounded-sm px-3 py-2 text-sm text-charcoal hover:bg-cream-dark">{t('orders')}</Link>
            <Link href="/wishlists" className="rounded-sm px-3 py-2 text-sm text-charcoal hover:bg-cream-dark">{t('wishlists')}</Link>
          </nav>
          <div>{children}</div>
        </div>
      </div>
    </AccountGuard>
  );
}
