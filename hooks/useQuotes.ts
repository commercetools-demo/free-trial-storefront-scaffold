'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_QUOTES, keyQuote } from '@/lib/cache-keys';
import { useBusinessUnit } from '@/context/BusinessUnitContext';
import type { QuoteThread } from '@/lib/types';

export function useQuotes() {
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;
  const { data, isLoading } = useSWR<QuoteThread[]>(
    buKey ? [KEY_QUOTES, buKey] : null,
    async () => {
      const res = await fetch('/api/quotes');
      return res.ok ? ((await res.json()).quotes ?? []) : [];
    },
    { revalidateOnFocus: false }
  );
  return { quotes: data ?? [], isLoading };
}

export function useQuote(quoteRequestId: string | null) {
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;
  const { data, isLoading, mutate } = useSWR<QuoteThread | null>(
    quoteRequestId && buKey ? [keyQuote(quoteRequestId), buKey] : null,
    async () => {
      const res = await fetch(`/api/quotes/${quoteRequestId}`);
      return res.ok ? (await res.json()).quote : null;
    },
    { revalidateOnFocus: false }
  );
  return { quote: data ?? null, isLoading, mutate };
}

export function useQuoteActions(quoteRequestId: string) {
  const { mutate } = useSWRConfig();
  const { currentBusinessUnit } = useBusinessUnit();
  const buKey = currentBusinessUnit?.key;

  function refresh() {
    if (!buKey) return;
    mutate([keyQuote(quoteRequestId), buKey]);
    mutate([KEY_QUOTES, buKey]);
  }

  async function act(quoteId: string, action: 'accept' | 'decline' | 'renegotiate', buyerComment?: string) {
    const res = await fetch(`/api/quotes/${quoteId}/actions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, buyerComment }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Action failed');
    const data = await res.json();
    refresh();
    return data as { orderId?: string; ok?: boolean };
  }

  return { act };
}
