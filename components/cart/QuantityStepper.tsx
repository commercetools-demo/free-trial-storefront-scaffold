'use client';

import { useState } from 'react';

export default function QuantityStepper({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (q: number) => Promise<unknown> | void;
}) {
  const [busy, setBusy] = useState(false);

  async function set(q: number) {
    if (q < 1 || busy) return;
    setBusy(true);
    try {
      await onChange(q);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center rounded-full border border-border">
      <button
        onClick={() => set(quantity - 1)}
        disabled={busy || quantity <= 1}
        aria-label="Decrease quantity"
        className="h-9 w-9 rounded-full text-lg leading-none disabled:opacity-30 hover:bg-mist"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
      <button
        onClick={() => set(quantity + 1)}
        disabled={busy}
        aria-label="Increase quantity"
        className="h-9 w-9 rounded-full text-lg leading-none disabled:opacity-30 hover:bg-mist"
      >
        +
      </button>
    </div>
  );
}
