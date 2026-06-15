import { HTMLAttributes } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'hot';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-700',
  info: 'bg-violet/10 text-violet-dark',
  hot: 'bg-aurora text-white',
};

export default function Badge({
  variant = 'info',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
