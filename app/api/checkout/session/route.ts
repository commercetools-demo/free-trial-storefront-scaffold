import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { projectKey, apiUrl, authUrl } from '@/lib/ct/client';

const APP_KEY = process.env.CTP_CHECKOUT_APP_KEY!;

// Derive region from CTP_API_URL — no separate region variable.
// https://api.us-central1.gcp.commercetools.com → us-central1.gcp
const REGION = apiUrl.replace(/^https?:\/\/api\./, '').replace(/\.commercetools\.com\/?$/, '');

async function getManageSessionsToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.CTP_CLIENT_ID}:${process.env.CTP_CLIENT_SECRET}`
  ).toString('base64');
  const res = await fetch(`${authUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&scope=manage_sessions:${projectKey}`,
  });
  if (!res.ok) throw new Error('Failed to obtain manage_sessions token');
  return (await res.json()).access_token;
}

export async function POST() {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.cartId) {
    return NextResponse.json({ error: 'No active cart' }, { status: 400 });
  }
  if (!APP_KEY) {
    return NextResponse.json(
      { error: 'Checkout is not configured (CTP_CHECKOUT_APP_KEY missing).' },
      { status: 500 }
    );
  }

  try {
    const token = await getManageSessionsToken();
    const res = await fetch(`https://session.${REGION}.commercetools.com/${projectKey}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        cart: { cartRef: { id: session.cartId } },
        metadata: { applicationKey: APP_KEY },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Session creation failed: ${text}` }, { status: 502 });
    }
    const data = await res.json();
    // Return projectKey + region so the browser needs no public env vars.
    return NextResponse.json({ sessionId: data.id, projectKey, region: REGION });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create checkout session';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
