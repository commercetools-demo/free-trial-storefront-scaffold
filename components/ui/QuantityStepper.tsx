'use client';
import { useTranslations } from 'next-intl';

export function QuantityStepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const t = useTranslations('product');
  return (
    <div className="inline-flex items-center border border-border rounded-sm">
      <button
        type="button"
        className="px-3 py-1.5 text-charcoal hover:bg-cream-dark disabled:opacity-30"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        aria-label={t('decreaseQuantity')}
      >
        −
      </button>
      <span className="w-10 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        className="px-3 py-1.5 text-charcoal hover:bg-cream-dark disabled:opacity-30"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        aria-label={t('increaseQuantity')}
      >
        +
      </button>
    </div>
  );
}
