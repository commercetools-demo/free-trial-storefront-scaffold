import { apiRoot } from './client';
import { mapQuoteThread } from '@/lib/mappers/quote';
import type { QuoteThread } from '@/lib/types';
import type { Quote, QuoteRequest } from '@commercetools/platform-sdk';

function associate(associateId: string, businessUnitKey: string) {
  return apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey });
}

// ---- Quote request creation (from cart) ----

export async function createQuoteRequestFromCart(
  associateId: string,
  businessUnitKey: string,
  cartId: string,
  cartVersion: number,
  comment?: string
): Promise<QuoteRequest> {
  const { body } = await associate(associateId, businessUnitKey)
    .quoteRequests()
    .post({
      body: {
        cart: { id: cartId, typeId: 'cart' },
        cartVersion,
        ...(comment ? { comment } : {}),
      },
    })
    .execute();
  return body;
}

// ---- Reads ----

async function getAllQuoteRequests(associateId: string, businessUnitKey: string): Promise<QuoteRequest[]> {
  const { body } = await associate(associateId, businessUnitKey)
    .quoteRequests()
    .get({ queryArgs: { limit: 100, sort: 'createdAt desc' } })
    .execute();
  return body.results;
}

async function getAllQuotes(associateId: string, businessUnitKey: string): Promise<Quote[]> {
  const { body } = await associate(associateId, businessUnitKey)
    .quotes()
    .get({ queryArgs: { limit: 200, sort: 'createdAt desc', expand: ['quoteRequest', 'stagedQuote'] } })
    .execute();
  return body.results;
}

/** Unified thread list: one thread per quote request, with its descendant quote rounds. */
export async function getQuoteThreads(
  associateId: string,
  businessUnitKey: string,
  locale?: string
): Promise<QuoteThread[]> {
  const [requests, quotes] = await Promise.all([
    getAllQuoteRequests(associateId, businessUnitKey),
    getAllQuotes(associateId, businessUnitKey),
  ]);

  const quotesByRequest = new Map<string, Quote[]>();
  for (const q of quotes) {
    const qrId = q.quoteRequest?.id;
    if (!qrId) continue;
    const arr = quotesByRequest.get(qrId) ?? [];
    arr.push(q);
    quotesByRequest.set(qrId, arr);
  }

  return requests.map((qr) => mapQuoteThread(qr, quotesByRequest.get(qr.id) ?? [], locale));
}

export async function getQuoteThreadByRequestId(
  associateId: string,
  businessUnitKey: string,
  quoteRequestId: string,
  locale?: string
): Promise<QuoteThread | null> {
  const { body: qr } = await associate(associateId, businessUnitKey)
    .quoteRequests()
    .withId({ ID: quoteRequestId })
    .get()
    .execute();
  const { body: quotesPage } = await associate(associateId, businessUnitKey)
    .quotes()
    .get({
      queryArgs: {
        where: `quoteRequest(id="${quoteRequestId}")`,
        sort: 'createdAt asc',
        expand: ['quoteRequest', 'stagedQuote'],
        limit: 100,
      },
    })
    .execute();
  return mapQuoteThread(qr, quotesPage.results, locale);
}

// ---- Buyer actions ----

async function currentQuoteVersion(associateId: string, businessUnitKey: string, quoteId: string): Promise<number> {
  const { body } = await associate(associateId, businessUnitKey).quotes().withId({ ID: quoteId }).get().execute();
  return body.version;
}

export async function changeQuoteState(
  associateId: string,
  businessUnitKey: string,
  quoteId: string,
  quoteState: 'Accepted' | 'Declined'
): Promise<Quote> {
  const version = await currentQuoteVersion(associateId, businessUnitKey, quoteId);
  const { body } = await associate(associateId, businessUnitKey)
    .quotes()
    .withId({ ID: quoteId })
    .post({ body: { version, actions: [{ action: 'changeQuoteState', quoteState }] } })
    .execute();
  return body;
}

export async function requestQuoteRenegotiation(
  associateId: string,
  businessUnitKey: string,
  quoteId: string,
  buyerComment: string
): Promise<Quote> {
  const version = await currentQuoteVersion(associateId, businessUnitKey, quoteId);
  const { body } = await associate(associateId, businessUnitKey)
    .quotes()
    .withId({ ID: quoteId })
    .post({ body: { version, actions: [{ action: 'requestQuoteRenegotiation', buyerComment }] } })
    .execute();
  return body;
}

/** Accept a quote and create the order from it. Sequential: accept → order. */
export async function acceptQuoteAndCreateOrder(
  associateId: string,
  businessUnitKey: string,
  quoteId: string
): Promise<{ orderId: string }> {
  const accepted = await changeQuoteState(associateId, businessUnitKey, quoteId, 'Accepted');
  const { body: order } = await associate(associateId, businessUnitKey)
    .orders()
    .orderQuote()
    .post({ body: { quote: { id: quoteId, typeId: 'quote' }, version: accepted.version } })
    .execute();
  return { orderId: order.id };
}
