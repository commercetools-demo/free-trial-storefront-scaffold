'use client';
import { useEffect, useState } from 'react';
import { Select, Input, Button } from '@/components/ui';

type Field = 'totalPrice.centAmount' | 'lineItemCount' | 'totalPrice.currencyCode';

interface Condition {
  field: Field;
  operator: string;
  value: string;
}

const FIELD_OPTIONS: { value: Field; label: string; operators: string[]; help: string }[] = [
  { value: 'totalPrice.centAmount', label: 'Order total', operators: ['>', '>=', '<', '<=', '='], help: 'Amount in major units (e.g. 5000 = $5,000)' },
  { value: 'lineItemCount', label: 'Line item count', operators: ['>', '>=', '<', '<=', '='], help: 'Number of distinct line items' },
  { value: 'totalPrice.currencyCode', label: 'Currency', operators: ['=', '!='], help: 'ISO 4217 code, e.g. USD' },
];

function buildPredicateString(conditions: Condition[]): string {
  return conditions
    .map((c) => {
      if (c.field === 'totalPrice.centAmount') {
        const cents = Math.round((parseFloat(c.value) || 0) * 100);
        return `totalPrice.centAmount ${c.operator} ${cents}`;
      }
      if (c.field === 'lineItemCount') return `lineItemCount ${c.operator} ${parseInt(c.value, 10) || 0}`;
      if (c.field === 'totalPrice.currencyCode') return `totalPrice.currencyCode ${c.operator} "${c.value}"`;
      return '';
    })
    .filter(Boolean)
    .join(' and ');
}

export function parsePredicate(str: string): Condition[] {
  if (!str) return [];
  return str
    .split(' and ')
    .map((part): Condition | null => {
      const total = part.match(/(?:order\.)?totalPrice\.centAmount\s*(>=|<=|>|<|=)\s*(\d+)/);
      if (total) return { field: 'totalPrice.centAmount', operator: total[1], value: String(parseInt(total[2], 10) / 100) };
      const count = part.match(/(?:order\.)?lineItemCount\s*(>=|<=|>|<|=)\s*(\d+)/);
      if (count) return { field: 'lineItemCount', operator: count[1], value: count[2] };
      const cur = part.match(/(?:order\.)?totalPrice\.currencyCode\s*(=|!=)\s*"([^"]+)"/);
      if (cur) return { field: 'totalPrice.currencyCode', operator: cur[1], value: cur[2] };
      return null;
    })
    .filter((c): c is Condition => c !== null);
}

export function PredicateBuilder({
  initialPredicate,
  onChange,
}: {
  initialPredicate?: string;
  onChange: (predicate: string) => void;
}) {
  const [conditions, setConditions] = useState<Condition[]>(
    () => parsePredicate(initialPredicate ?? '') || []
  );

  useEffect(() => {
    onChange(buildPredicateString(conditions));
  }, [conditions, onChange]);

  function addCondition() {
    setConditions((c) => [...c, { field: 'totalPrice.centAmount', operator: '>', value: '' }]);
  }
  function update(i: number, patch: Partial<Condition>) {
    setConditions((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function remove(i: number) {
    setConditions((cs) => cs.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {conditions.length === 0 && (
        <p className="text-sm text-charcoal-light">
          No conditions — the rule will match every order. Add a condition to scope it.
        </p>
      )}
      {conditions.map((c, i) => {
        const fieldOpt = FIELD_OPTIONS.find((f) => f.value === c.field)!;
        return (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={c.field}
              onChange={(e) => {
                const field = e.target.value as Field;
                const opt = FIELD_OPTIONS.find((f) => f.value === field)!;
                update(i, { field, operator: opt.operators[0], value: '' });
              }}
              className="flex-1"
            >
              {FIELD_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
            <Select value={c.operator} onChange={(e) => update(i, { operator: e.target.value })} className="w-20">
              {fieldOpt.operators.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </Select>
            <Input
              value={c.value}
              onChange={(e) => update(i, { value: e.target.value })}
              placeholder={fieldOpt.help}
              className="flex-1"
            />
            <button onClick={() => remove(i)} className="px-2 text-charcoal-light hover:text-red-600" aria-label="Remove condition">
              ✕
            </button>
          </div>
        );
      })}
      <Button type="button" variant="outline" size="sm" onClick={addCondition}>
        + Add condition
      </Button>
    </div>
  );
}
