import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

// Checkout Application key — kept as a const per project requirement.
// Create a Checkout Application with this key in Merchant Center → Checkout.
const APP_KEY = 'storefront-checkout';

const PROJECT_KEY = process.env.CTP_PROJECT_KEY!;
const API_URL = process.env.CTP_API_URL!;
const AUTH_URL = process.env.CTP_AUTH_URL!;
const CLIENT_ID = process.env.CTP_CLIENT_ID!;
const CLIENT_SECRET = process.env.CTP_CLIENT_SECRET!;
const SCOPES = process.env.CTP_SCOPES!;

// Derive region from CTP_API_URL — no separate CT_REGION variable.
// https://api.us-central1.gcp.commercetools.com → us-central1.gcp
const REGION = API_URL.replace(/^https?:\/\/api\./, '').replace(/\.commercetools\.com\/?$/, '');

async function getManageSessionsToken(): Promise<string> {
  const res = await fetch(`${AUTH_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: `grant_type=client_credentials&scope=${encodeURIComponent(SCOPES)}`,
  });
  if (!res.ok) throw new Error('Failed to obtain token');
  const data = await res.json();
  return data.access_token;
}

// POST /api/checkout/session — create a Checkout Session for the current cart
export async function POST() {
  const session = await getSession();
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  try {
    const token = await getManageSessionsToken();
    const res = await fetch(`https://session.${REGION}.commercetools.com/${PROJECT_KEY}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cart: { cartRef: { id: session.cartId } },
        metadata: { applicationKey: APP_KEY },
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: 'Failed to create checkout session', detail },
        { status: 502 }
      );
    }
    const data = await res.json();
    // Return projectKey + region so the browser SDK needs no public env vars.
    return NextResponse.json({ sessionId: data.id, projectKey: PROJECT_KEY, region: REGION });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Checkout session error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
