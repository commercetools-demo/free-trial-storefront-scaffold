import { HTMLAttributes } from 'react';

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

export default function Spinner({ size = 20, className = '', ...props }: SpinnerProps) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-violet/30 border-t-violet animate-spin-slow ${className}`}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}
