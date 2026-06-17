'use client';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function Table<T extends { id?: string }>({
  columns,
  data,
  loading,
  emptyMessage = 'No records.',
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="text-terra" />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-charcoal-light">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-cream-dark/50 text-left">
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 font-medium text-charcoal-light ${c.className ?? ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-border last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-cream-dark/40' : ''
              }`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 text-charcoal ${c.className ?? ''}`}>
                  {c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
