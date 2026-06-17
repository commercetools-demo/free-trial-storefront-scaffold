'use client';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import type { Variant } from '@/lib/types';
import { attrKey, attrLabel, getAttr } from '@/lib/attr';
import {
  VARIANT_SELECTOR_BLOCKLIST,
  VARIANT_RENDERER_MAP,
  VARIANT_COLOR_CODE_ATTR,
  VARIANT_SORT_ORDER,
} from '@/lib/ct/variant-config';

interface SelectorAttr {
  name: string;
  values: { key: string; label: string; colorCode?: string }[];
}

export function VariantSelector({
  variants,
  currentSku,
  labels,
}: {
  variants: Variant[];
  currentSku: string;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const current = variants.find((v) => v.sku === currentSku) ?? variants[0];

  // Determine attributes that vary across variants and aren't blocklisted.
  const attrNames = new Set<string>();
  for (const v of variants) {
    for (const a of v.attributes) {
      if (!VARIANT_SELECTOR_BLOCKLIST.includes(a.name)) attrNames.add(a.name);
    }
  }

  const selectors: SelectorAttr[] = [];
  for (const name of attrNames) {
    const seen = new Map<string, { key: string; label: string; colorCode?: string }>();
    for (const v of variants) {
      const a = getAttr(v, name);
      if (!a) continue;
      const key = attrKey(a.value);
      if (!key || seen.has(key)) continue;
      const colorAttr = VARIANT_COLOR_CODE_ATTR[name];
      const colorCode = colorAttr ? (getAttr(v, colorAttr)?.value as string | undefined) : undefined;
      seen.set(key, { key, label: attrLabel(a.value, locale), colorCode });
    }
    if (seen.size > 1) selectors.push({ name, values: [...seen.values()] });
  }

  // sort by configured order
  selectors.sort((a, b) => {
    const ia = VARIANT_SORT_ORDER.indexOf(a.name);
    const ib = VARIANT_SORT_ORDER.indexOf(b.name);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  if (selectors.length === 0) return null;

  function selectValue(name: string, key: string) {
    // Keep other currently-selected attribute values where possible.
    const desired: Record<string, string> = {};
    for (const sel of selectors) {
      const cur = getAttr(current, sel.name);
      if (cur) desired[sel.name] = attrKey(cur.value);
    }
    desired[name] = key;

    // Score each variant by how many desired attrs it matches; require the changed attr matches.
    let best: Variant | undefined;
    let bestScore = -1;
    for (const v of variants) {
      if (attrKey(getAttr(v, name)?.value) !== key) continue;
      let score = 0;
      for (const [n, k] of Object.entries(desired)) {
        if (attrKey(getAttr(v, n)?.value) === k) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        best = v;
      }
    }
    if (best) router.push(`/product/${best.sku}`);
  }

  return (
    <div className="flex flex-col gap-5">
      {selectors.map((sel) => {
        const renderer = VARIANT_RENDERER_MAP[sel.name] ?? 'pill';
        const currentKey = attrKey(getAttr(current, sel.name)?.value);
        return (
          <div key={sel.name}>
            <div className="mb-2 text-sm font-medium capitalize text-charcoal">
              {labels[sel.name] ?? sel.name.replace(/[-_]/g, ' ')}
            </div>
            <div className="flex flex-wrap gap-2">
              {sel.values.map((val) => {
                const selected = val.key === currentKey;
                if (renderer === 'color') {
                  return (
                    <button
                      key={val.key}
                      onClick={() => selectValue(sel.name, val.key)}
                      title={val.label}
                      aria-label={val.label}
                      aria-pressed={selected}
                      className={`h-8 w-8 rounded-full border-2 ${
                        selected ? 'border-charcoal' : 'border-border'
                      }`}
                      style={{ backgroundColor: val.colorCode || '#ccc' }}
                    />
                  );
                }
                return (
                  <button
                    key={val.key}
                    onClick={() => selectValue(sel.name, val.key)}
                    aria-pressed={selected}
                    className={`rounded-sm border px-3 py-1.5 text-sm ${
                      selected
                        ? 'border-charcoal bg-charcoal text-cream'
                        : 'border-border text-charcoal hover:border-charcoal'
                    }`}
                  >
                    {val.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
