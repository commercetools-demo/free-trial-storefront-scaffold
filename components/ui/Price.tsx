'use client';
import { useLocale } from 'next-intl';
import { formatMoney } from '@/lib/utils';
import type { Price } from '@/lib/types';

export function Money({ centAmount, currencyCode }: { centAmount: number; currencyCode: string }) {
  const locale = useLocale();
  return <>{formatMoney(centAmount, currencyCode, locale)}</>;
}

export function PriceDisplay({ price, className = '' }: { price?: Price; className?: string }) {
  const locale = useLocale();
  if (!price) return <span className={`text-charcoal-light ${className}`}>—</span>;
  const hasDiscount = !!price.discounted;
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={hasDiscount ? 'text-terra font-medium' : 'text-charcoal font-medium'}>
        {formatMoney(
          hasDiscount ? price.discounted!.centAmount : price.centAmount,
          price.currencyCode,
          locale
        )}
      </span>
      {hasDiscount && (
        <span className="text-sm text-charcoal-light line-through">
          {formatMoney(price.centAmount, price.currencyCode, locale)}
        </span>
      )}
    </span>
  );
}
