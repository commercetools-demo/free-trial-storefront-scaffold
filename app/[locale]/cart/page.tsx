import { getTranslations } from 'next-intl/server';
import { CartView } from '@/components/cart/CartView';

export const metadata = { title: 'Cart' };

export default async function CartPage() {
  const t = await getTranslations('cart');
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-semibold text-charcoal">{t('title')}</h1>
      <CartView />
    </div>
  );
}
