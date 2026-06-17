'use client';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const styles: Record<Variant, string> = {
  primary: 'bg-charcoal text-cream hover:bg-charcoal-light disabled:bg-charcoal/40',
  secondary: 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream disabled:opacity-40',
  ghost: 'text-charcoal hover:bg-cream-dark disabled:opacity-40',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
