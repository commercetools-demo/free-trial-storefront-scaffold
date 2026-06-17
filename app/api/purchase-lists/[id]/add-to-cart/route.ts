import { NextRequest, NextResponse } from 'next/server';
import { getSession, jsonWithSession } from '@/lib/session';
import { getPurchaseListById } from '@/lib/ct/purchaseLists';
import { getCart, createCart, addLineItem } from '@/lib/ct/cart';
import { getStoreChannelData } from '@/lib/ct/stores';
import type { Session } from '@/lib/session';

// Adds every item in a purchase list to the active cart (creating one if needed).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.customerId || !session.businessUnitKey || !session.storeKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const { customerId, businessUnitKey, storeKey, locale } = session as Required<
    Pick<Session, 'customerId' | 'businessUnitKey' | 'storeKey'>
  > &
    Session;

  try {
    const list = await getPurchaseListById(customerId, businessUnitKey, id, locale);
    if (list.items.length === 0) {
      return NextResponse.json({ error: 'Purchase list is empty' }, { status: 400 });
    }

    let nextSession = session;
    let cartId = session.cartId;
    if (!cartId) {
      const created = await createCart(
        customerId,
        customerId,
        businessUnitKey,
        storeKey,
        session.currency ?? 'USD',
        session.country ?? 'US',
        locale
      );
      cartId = created.id;
      nextSession = { ...session, cartId };
    }

    const { distributionChannelId } = await getStoreChannelData(storeKey);
    // Add items sequentially — each addLineItem needs the latest cart version.
    let cart = await getCart(cartId, customerId, businessUnitKey, locale);
    for (const item of list.items) {
      if (item.variantId == null) continue;
      cart = await addLineItem(
        cart.id,
        cart.version,
        item.productId,
        item.variantId,
        item.quantity,
        customerId,
        businessUnitKey,
        storeKey,
        session.distributionChannelId ?? distributionChannelId,
        locale
      );
    }
    return jsonWithSession({ cart }, nextSession);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to add items to cart';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
