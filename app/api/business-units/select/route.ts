import { NextRequest, NextResponse } from 'next/server';
import { getSession, jsonWithSession } from '@/lib/session';
import { getStoreChannelData } from '@/lib/ct/stores';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { businessUnitKey?: string; storeKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { businessUnitKey, storeKey } = body;
  if (!businessUnitKey || !storeKey) {
    return NextResponse.json({ error: 'businessUnitKey and storeKey are required' }, { status: 400 });
  }

  const { storeId, supplyChannelId, distributionChannelId, productSelectionId } =
    await getStoreChannelData(storeKey);

  // Atomic write of all five B2B fields. Keep existing cartId — the cart stays
  // valid for the new BU+store context.
  return jsonWithSession(
    { ok: true },
    {
      ...session,
      businessUnitKey,
      storeKey,
      storeId,
      supplyChannelId,
      distributionChannelId,
      productSelectionId,
    }
  );
}
