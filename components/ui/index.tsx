import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-terra text-white hover:bg-terra-dark disabled:bg-terra/50',
  secondary: 'bg-charcoal text-white hover:bg-charcoal-light disabled:opacity-50',
  outline: 'border border-border bg-transparent text-charcoal hover:bg-cream-dark disabled:opacity-50',
  ghost: 'bg-transparent text-charcoal hover:bg-cream-dark disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium disabled:cursor-not-allowed',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-charcoal',
        'placeholder:text-charcoal-light/60 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-charcoal',
        'placeholder:text-charcoal-light/60 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-charcoal',
        'focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-sm font-medium text-charcoal mb-1', className)}>
      {children}
    </label>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-white', className)}>{children}</div>
  );
}

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-cream-dark text-charcoal-light',
  success: 'bg-sage/20 text-sage',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', BADGE_TONES[tone], className)}>
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      aria-label="Loading"
    />
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 px-6 text-center">
      <p className="text-base font-medium text-charcoal">{title}</p>
      {description && <p className="mt-1 text-sm text-charcoal-light max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Alert({ tone = 'danger', children }: { tone?: 'danger' | 'success' | 'info'; children: ReactNode }) {
  const tones = {
    danger: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-sage/40 bg-sage/10 text-sage',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  };
  return <div className={cn('rounded-md border px-4 py-3 text-sm', tones[tone])}>{children}</div>;
}
