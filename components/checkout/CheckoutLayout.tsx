'use client';

import { Link } from '@/i18n/routing';
import { useCartContext } from '@/context/CartContext';
import OrderSummary from '@/components/cart/OrderSummary';
import { CheckIcon } from '@/components/ui/icons';

const STEPS = [
  { key: 'addresses', label: 'Address' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

export default function CheckoutLayout({
  step,
  children,
}: {
  step: StepKey;
  children: React.ReactNode;
}) {
  const { cart } = useCartContext();
  const currentIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10">
      <Link href="/" className="text-2xl font-black">
        <span className="text-gradient">LUMINA</span>
      </Link>

      {/* Step indicator */}
      <ol className="mt-8 mb-10 flex items-center gap-2 text-sm font-semibold">
        {STEPS.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                  active
                    ? 'bg-aurora text-white'
                    : done
                      ? 'bg-ink text-white'
                      : 'border border-border text-ink/40'
                }`}
              >
                {done ? <CheckIcon width={14} height={14} /> : i + 1}
              </span>
              <span className={active ? 'text-ink' : 'text-ink/40'}>{s.label}</span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>{children}</div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          {cart && <OrderSummary cart={cart} showDiscount={false} />}
        </div>
      </div>
    </div>
  );
}
