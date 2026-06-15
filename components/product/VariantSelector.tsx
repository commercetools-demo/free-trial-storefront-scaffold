'use client';

import { useRouter } from '@/i18n/routing';
import type { Variant } from '@/lib/types';

function attrText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if ('label' in v) {
      const label = v.label;
      if (typeof label === 'string') return label;
      if (label && typeof label === 'object') return Object.values(label as object)[0] as string;
    }
    if ('key' in v && typeof v.key === 'string') return v.key;
    const first = Object.values(v)[0];
    if (typeof first === 'string') return first;
  }
  return '';
}

function variantLabel(v: Variant): string {
  const preferred = ['color', 'colour', 'size', 'variant'];
  for (const name of preferred) {
    const attr = v.attributes.find((a) => a.name.toLowerCase() === name);
    const text = attr && attrText(attr.value);
    if (text) return text;
  }
  const first = v.attributes.map((a) => attrText(a.value)).find(Boolean);
  return first || v.sku || `Variant ${v.id}`;
}

export default function VariantSelector({
  variants,
  activeSku,
}: {
  variants: Variant[];
  activeSku?: string;
}) {
  const router = useRouter();
  if (variants.length <= 1) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink">Options</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = v.sku === activeSku;
          return (
            <button
              key={v.id}
              disabled={!v.sku}
              onClick={() => v.sku && router.push(`/p/${v.sku}`)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-violet bg-violet text-white'
                  : 'border-border text-ink hover:border-violet'
              } ${!v.isOnStock ? 'opacity-40' : ''}`}
            >
              {variantLabel(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
