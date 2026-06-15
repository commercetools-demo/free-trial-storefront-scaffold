import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-full whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/50';

const variants: Record<Variant, string> = {
  primary:
    'bg-aurora text-white shadow-lg shadow-violet/20 hover:shadow-xl hover:shadow-magenta/30 hover:-translate-y-0.5',
  secondary: 'bg-ink text-white hover:bg-ink-soft',
  outline: 'border-2 border-ink text-ink hover:bg-ink hover:text-white',
  ghost: 'text-ink hover:bg-mist',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-6 py-3',
  lg: 'text-base px-8 py-4',
};

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin-slow" />
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  as?: 'button';
}
interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  as: 'a';
}

type Props = ButtonProps | AnchorProps;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(function Button(
  { variant = 'primary', size = 'md', isLoading, className = '', children, ...props },
  ref,
) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (props.as === 'a') {
    const { as: _anchorAs, ...rest } = props as AnchorProps;
    void _anchorAs;
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={cls} {...rest}>
        {isLoading && <Spinner />}
        {children}
      </a>
    );
  }
  const { as: _btnAs, disabled, ...rest } = props as ButtonProps;
  void _btnAs;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cls}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
});

export default Button;
