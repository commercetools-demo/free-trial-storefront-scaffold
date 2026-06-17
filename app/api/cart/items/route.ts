import { NextRequest, NextResponse } from 'next/server';
import { getSession, jsonWithSession } from '@/lib/session';
import {
  getCart,
  createCart,
  addLineItem,
  changeLineItemQuantity,
  removeLineItem,
} from '@/lib/ct/cart';
import { getStoreChannelData } from '@/lib/ct/stores';
import type { Session } from '@/lib/session';

interface B2BCtx {
  customerId: string;
  businessUnitKey: string;
  storeKey: string;
  session: Session;
}

function requireB2B(session: Session): B2BCtx | NextResponse {
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!session.businessUnitKey || !session.storeKey) {
    return NextResponse.json({ error: 'No active business unit' }, { status: 400 });
  }
  return {
    customerId: session.customerId,
    businessUnitKey: session.businessUnitKey,
    storeKey: session.storeKey,
    session,
  };
}

// Add line item — auto-creates the cart on first add.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const ctx = requireB2B(session);
  if (ctx instanceof NextResponse) return ctx;

  let body: { productId?: string; variantId?: number; quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { productId, variantId, quantity = 1 } = body;
  if (!productId || variantId == null) {
    return NextResponse.json({ error: 'productId and variantId are required' }, { status: 400 });
  }

  const { customerId, businessUnitKey, storeKey } = ctx;
  let nextSession = session;

  try {
    let cartId = session.cartId;
    let version: number;

    if (!cartId) {
      const created = await createCart(
        customerId,
        customerId,
        businessUnitKey,
        storeKey,
        session.currency ?? 'USD',
        session.country ?? 'US',
        session.locale
      );
      cartId = created.id;
      version = created.version;
      // Persist cartId before addLineItem so it survives an item-add failure.
      nextSession = { ...session, cartId };
    } else {
      const existing = await getCart(cartId, customerId, businessUnitKey, session.locale);
      version = existing.version;
    }

    const { distributionChannelId } = await getStoreChannelData(storeKey);
    const cart = await addLineItem(
      cartId,
      version,
      productId,
      variantId,
      quantity,
      customerId,
      businessUnitKey,
      storeKey,
      session.distributionChannelId ?? distributionChannelId,
      session.locale
    );
    return jsonWithSession({ cart }, nextSession);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to add item';
    return jsonWithSession({ error: msg }, nextSession, 500);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const ctx = requireB2B(session);
  if (ctx instanceof NextResponse) return ctx;
  if (!session.cartId) return NextResponse.json({ error: 'No active cart' }, { status: 400 });

  const { lineItemId, quantity } = await req.json();
  const { customerId, businessUnitKey } = ctx;
  try {
    const current = await getCart(session.cartId, customerId, businessUnitKey, session.locale);
    const cart = await changeLineItemQuantity(
      session.cartId,
      current.version,
      lineItemId,
      quantity,
      customerId,
      businessUnitKey,
      session.locale
    );
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const ctx = requireB2B(session);
  if (ctx instanceof NextResponse) return ctx;
  if (!session.cartId) return NextResponse.json({ error: 'No active cart' }, { status: 400 });

  const { lineItemId } = await req.json();
  const { customerId, businessUnitKey } = ctx;
  try {
    const current = await getCart(session.cartId, customerId, businessUnitKey, session.locale);
    const cart = await removeLineItem(
      session.cartId,
      current.version,
      lineItemId,
      customerId,
      businessUnitKey,
      session.locale
    );
    return NextResponse.json({ cart });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to remove item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
