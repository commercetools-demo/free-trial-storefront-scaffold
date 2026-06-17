'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { OrderSummary } from './OrderSummary';

const STEPS = [
  { key: 'addresses', label: 'Address', href: '/checkout/addresses' },
  { key: 'shipping', label: 'Shipping', href: '/checkout/shipping' },
  { key: 'payment', label: 'Payment', href: '/checkout/payment' },
] as const;

export function CheckoutShell({
  current,
  children,
}: {
  current: 'addresses' | 'shipping' | 'payment';
  children: React.ReactNode;
}) {
  const t = useTranslations('checkout');
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  const stepLabels: Record<(typeof STEPS)[number]['key'], string> = {
    addresses: t('stepAddress'),
    shipping: t('stepShipping'),
    payment: t('stepPayment'),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                i <= currentIdx ? 'bg-charcoal text-cream' : 'bg-cream-dark text-charcoal-light'
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-sm ${i === currentIdx ? 'font-medium text-charcoal' : 'text-charcoal-light'}`}>
              {stepLabels[s.key]}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 text-charcoal-light">—</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>{children}</div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary />
          <Link href="/cart" className="mt-4 block text-center text-sm text-terra hover:underline">
            {t('editCart')}
          </Link>
        </aside>
      </div>
    </div>
  );
}
