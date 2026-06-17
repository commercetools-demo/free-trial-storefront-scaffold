import type { Quote as CtQuote, QuoteRequest as CtQuoteRequest, LineItem } from '@commercetools/platform-sdk';
import type { QuoteThread, QuoteRound, CartLineItem } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

function mapLineItems(lineItems: LineItem[], locale: string): CartLineItem[] {
  return (lineItems ?? []).map((li) => ({
    id: li.id,
    productId: li.productId,
    variantId: li.variant.id,
    name: getLocalizedString(li.name as Record<string, string>, locale),
    sku: li.variant.sku,
    quantity: li.quantity,
    image: li.variant.images?.[0]?.url,
    unitPrice: { centAmount: li.price.value.centAmount, currencyCode: li.price.value.currencyCode },
    totalPrice: { centAmount: li.totalPrice.centAmount, currencyCode: li.totalPrice.currencyCode },
  }));
}

function mapRound(quote: CtQuote): QuoteRound {
  return {
    quoteId: quote.id,
    quoteVersion: quote.version,
    quoteState: quote.quoteState,
    // Per-round snapshot — Quote.sellerComment, NOT StagedQuote.sellerComment.
    sellerComment: quote.sellerComment,
    buyerComment: quote.buyerComment,
    validTo: quote.validTo,
    createdAt: quote.createdAt,
  };
}

/**
 * Build a thread from one QuoteRequest and the Quotes that descend from it
 * (linked via quote.quoteRequest.id), sorted oldest→newest.
 */
export function mapQuoteThread(qr: CtQuoteRequest, quotes: CtQuote[], locale = 'en-US'): QuoteThread {
  const rounds = quotes
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(mapRound);
  const latest = rounds[rounds.length - 1];

  return {
    id: qr.id,
    quoteRequestId: qr.id,
    quoteRequestState: qr.quoteRequestState,
    quoteRequestComment: qr.comment,
    latestQuoteId: latest?.quoteId,
    effectiveState: latest?.quoteState ?? qr.quoteRequestState,
    customerId: qr.customer?.id ?? '',
    businessUnitKey: qr.businessUnit?.key,
    totalPrice: { centAmount: qr.totalPrice.centAmount, currencyCode: qr.totalPrice.currencyCode },
    itemCount: (qr.lineItems ?? []).reduce((s, li) => s + li.quantity, 0),
    lineItems: mapLineItems(qr.lineItems ?? [], locale),
    rounds,
    createdAt: qr.createdAt,
    lastModifiedAt: latest?.createdAt ?? qr.lastModifiedAt,
  };
}

export const QUOTE_STATE_LABELS: Record<string, string> = {
  Submitted: 'Pending review',
  Accepted: 'Accepted',
  Pending: 'Quote ready',
  RenegotiationAddressed: 'Updated quote ready',
  DeclinedForRenegotiation: 'Renegotiation in progress',
  Declined: 'Declined',
  Withdrawn: 'Withdrawn',
  Cancelled: 'Cancelled',
  Closed: 'Closed',
  Rejected: 'Rejected',
};
