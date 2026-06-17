import { cn } from '@/components/ui';

const STEPS = [
  { key: 'addresses', label: 'Addresses' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
];

export function CheckoutSteps({ current }: { current: 'addresses' | 'shipping' | 'payment' }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="mb-8 flex items-center gap-2 text-sm">
      {STEPS.map((step, i) => (
        <li key={step.key} className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
              i < currentIndex && 'bg-sage text-white',
              i === currentIndex && 'bg-charcoal text-white',
              i > currentIndex && 'bg-cream-dark text-charcoal-light'
            )}
          >
            {i + 1}
          </span>
          <span className={cn(i === currentIndex ? 'font-medium text-charcoal' : 'text-charcoal-light')}>
            {step.label}
          </span>
          {i < STEPS.length - 1 && <span className="mx-1 text-border">—</span>}
        </li>
      ))}
    </ol>
  );
}
