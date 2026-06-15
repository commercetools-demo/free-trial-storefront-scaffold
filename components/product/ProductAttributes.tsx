import type { VariantAttribute } from '@/lib/types';

function attrText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(attrText).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if ('label' in v) {
      const label = v.label;
      if (typeof label === 'string') return label;
      if (label && typeof label === 'object') return Object.values(label as object)[0] as string;
    }
    if ('key' in v && typeof v.key === 'string') return v.key;
  }
  return '';
}

const HIDDEN = new Set(['color', 'colour', 'size', 'variant']);

export default function ProductAttributes({
  attributes,
  labels,
}: {
  attributes: VariantAttribute[];
  labels: Record<string, string>;
}) {
  const rows = attributes
    .filter((a) => !HIDDEN.has(a.name.toLowerCase()))
    .map((a) => ({ label: labels[a.name] ?? a.name, value: attrText(a.value) }))
    .filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Details</h2>
      <dl className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between gap-4 border-b border-border/50 py-2 sm:border-0">
            <dt className="text-sm text-ink/50">{r.label}</dt>
            <dd className="text-sm font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
