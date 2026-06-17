import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function Footer() {
  const t = await getTranslations('footer');
  return (
    <footer className="mt-20 border-t border-border bg-cream-dark">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-charcoal">My Brand</h3>
          <p className="text-sm text-charcoal-light">
            {t('tagline')}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-medium text-charcoal">{t('shop')}</h4>
          <ul className="space-y-2 text-sm text-charcoal-light">
            <li><Link href="/" className="hover:text-terra">{t('home')}</Link></li>
            <li><Link href="/search" className="hover:text-terra">{t('search')}</Link></li>
            <li><Link href="/wishlists" className="hover:text-terra">{t('wishlists')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-medium text-charcoal">{t('account')}</h4>
          <ul className="space-y-2 text-sm text-charcoal-light">
            <li><Link href="/account" className="hover:text-terra">{t('myAccount')}</Link></li>
            <li><Link href="/account/orders" className="hover:text-terra">{t('orders')}</Link></li>
            <li><Link href="/cart" className="hover:text-terra">{t('cart')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-medium text-charcoal">{t('about')}</h4>
          <p className="text-sm text-charcoal-light">
            {t('aboutText')}
          </p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-charcoal-light">
        {t('copyright', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
