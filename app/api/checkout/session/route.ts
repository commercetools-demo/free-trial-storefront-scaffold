import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const PROJECT_KEY = process.env.CTP_PROJECT_KEY!;
const API_URL = process.env.CTP_API_URL!;
const AUTH_URL = process.env.CTP_AUTH_URL!;
const CLIENT_ID = process.env.CTP_CLIENT_ID!;
const CLIENT_SECRET = process.env.CTP_CLIENT_SECRET!;
const SCOPES = process.env.CTP_SCOPES!;
const APP_KEY = process.env.CTP_CHECKOUT_APP_KEY!;

// Derive region from CTP_API_URL — no separate CT_REGION variable needed.
// https://api.us-central1.gcp.commercetools.com → us-central1.gcp
const REGION = API_URL.replace(/^https?:\/\/api\./, '').replace(/\.commercetools\.com\/?$/, '');

async function getManageSessionsToken(): Promise<string> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(
    `${AUTH_URL}/oauth/token?grant_type=client_credentials&scope=${SCOPES}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

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
        { error: `Could not create checkout session: ${detail}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    // Return projectKey + region so the browser SDK needs no NEXT_PUBLIC_ vars.
    return NextResponse.json({ sessionId: data.id, projectKey: PROJECT_KEY, region: REGION });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
