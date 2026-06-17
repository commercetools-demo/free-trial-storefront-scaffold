'use client';
import { use, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useQuote, useQuoteActions } from '@/hooks/useQuotes';
import { useAccount } from '@/hooks/useAccount';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, Button, Badge, Alert, Spinner, Textarea, Label } from '@/components/ui';
import { formatMoney } from '@/lib/utils';
import { QUOTE_STATE_LABELS } from '@/lib/mappers/quote';

const ACCEPT_STATES = ['Pending', 'RenegotiationAddressed'];
const RENEGOTIATE_STATES = ['Pending'];

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const locale = useLocale();
  const router = useRouter();
  const { quote, isLoading } = useQuote(id);
  const { act } = useQuoteActions(id);
  const { user } = useAccount();
  const { can } = usePermissions();

  const [renegotiating, setRenegotiating] = useState(false);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-terra" />
      </div>
    );
  }
  if (!quote) return <Alert tone="danger">Quote not found.</Alert>;

  const latestRound = quote.rounds[quote.rounds.length - 1];
  const isOwn = quote.customerId === user?.id;
  const canAccept = isOwn ? can('AcceptMyQuotes') : can('AcceptOthersQuotes');
  const canDecline = isOwn ? can('DeclineMyQuotes') : can('DeclineOthersQuotes');
  const canRenegotiate = isOwn ? can('RenegotiateMyQuotes') : can('RenegotiateOthersQuotes');

  const state = latestRound?.quoteState;
  const showAccept = !!latestRound && ACCEPT_STATES.includes(state!) && canAccept;
  const showDecline = !!latestRound && ACCEPT_STATES.includes(state!) && canDecline;
  const showRenegotiate = !!latestRound && RENEGOTIATE_STATES.includes(state!) && canRenegotiate;

  async function run(action: 'accept' | 'decline' | 'renegotiate', buyerComment?: string) {
    if (!latestRound) return;
    setBusy(true);
    setError(null);
    try {
      const result = await act(latestRound.quoteId, action, buyerComment);
      if (action === 'accept' && result.orderId) {
        router.push(`/checkout/confirmation?orderId=${result.orderId}` as `/${string}`);
      } else if (action === 'decline') {
        router.push('/dashboard/quotes');
      } else {
        setRenegotiating(false);
        setComment('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/quotes" className="text-sm text-charcoal-light hover:text-charcoal">
          ← Quotes
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-charcoal">Quote request</h1>
          <Badge tone="info">{QUOTE_STATE_LABELS[quote.effectiveState] ?? quote.effectiveState}</Badge>
        </div>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Timeline */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-charcoal">Negotiation</h2>
            <div className="mt-3 space-y-4">
              <div className="rounded-md bg-cream-dark/40 p-3">
                <p className="text-xs font-medium text-charcoal-light">Your request</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal">
                  {quote.quoteRequestComment || '(no comment)'}
                </p>
                <p className="mt-1 text-xs text-charcoal-light">
                  {new Date(quote.createdAt).toLocaleString(locale)}
                </p>
              </div>
              {quote.rounds.map((round, i) => (
                <div key={round.quoteId} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-charcoal-light">
                      Round {i + 1} — {QUOTE_STATE_LABELS[round.quoteState] ?? round.quoteState}
                    </p>
                    <span className="text-xs text-charcoal-light">{new Date(round.createdAt).toLocaleString(locale)}</span>
                  </div>
                  {round.sellerComment && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-charcoal">
                      <span className="text-charcoal-light">Seller: </span>
                      {round.sellerComment}
                    </p>
                  )}
                  {round.buyerComment && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal">
                      <span className="text-charcoal-light">You: </span>
                      {round.buyerComment}
                    </p>
                  )}
                  {round.validTo && (
                    <p className="mt-1 text-xs text-charcoal-light">
                      Valid until {new Date(round.validTo).toLocaleDateString(locale)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Line items */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-charcoal">Items</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {quote.lineItems.map((li) => (
                <li key={li.id} className="flex justify-between">
                  <span className="text-charcoal-light">
                    {li.name} × {li.quantity}
                  </span>
                  <span className="text-charcoal">
                    {formatMoney(li.totalPrice.centAmount, li.totalPrice.currencyCode, locale)}
                  </span>
                </li>
              ))}
            </ul>
            {quote.totalPrice && (
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(quote.totalPrice.centAmount, quote.totalPrice.currencyCode, locale)}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Actions */}
        <div>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-charcoal">Actions</h2>
            {!latestRound ? (
              <p className="mt-2 text-sm text-charcoal-light">
                Awaiting the seller&apos;s first quote. No actions available yet.
              </p>
            ) : !renegotiating ? (
              <div className="mt-3 space-y-2">
                {showAccept && (
                  <Button className="w-full" onClick={() => run('accept')} disabled={busy}>
                    {busy ? 'Working…' : 'Accept & place order'}
                  </Button>
                )}
                {showRenegotiate && (
                  <Button className="w-full" variant="outline" onClick={() => setRenegotiating(true)} disabled={busy}>
                    Renegotiate
                  </Button>
                )}
                {showDecline && (
                  <Button className="w-full" variant="danger" onClick={() => run('decline')} disabled={busy}>
                    Decline
                  </Button>
                )}
                {!showAccept && !showDecline && !showRenegotiate && (
                  <p className="text-sm text-charcoal-light">
                    No actions available for this quote in its current state.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div>
                  <Label htmlFor="reneg">Your counter-comment</Label>
                  <Textarea id="reneg" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => run('renegotiate', comment)} disabled={busy || !comment.trim()}>
                    {busy ? 'Sending…' : 'Send'}
                  </Button>
                  <Button variant="ghost" onClick={() => setRenegotiating(false)} disabled={busy}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
