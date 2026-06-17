import { NextRequest, NextResponse } from 'next/server';
import { loginCustomer } from '@/lib/ct/auth';
import { getBusinessUnitsForAssociate } from '@/lib/ct/businessUnits';
import { getStoreChannelData } from '@/lib/ct/stores';
import { getSession, jsonWithSession } from '@/lib/session';
import type { Session } from '@/lib/session';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  let customer;
  try {
    customer = await loginCustomer(email, password);
  } catch {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const prior = await getSession();

  // BU auto-selection — resolve the first BU + first store and channel data.
  let businessUnitKey: string | undefined;
  let storeKey: string | undefined;
  let storeId: string | undefined;
  let supplyChannelId: string | undefined;
  let distributionChannelId: string | undefined;
  let productSelectionId: string | undefined;

  try {
    const units = await getBusinessUnitsForAssociate(customer.id);
    const bu = units[0];
    const store = bu?.stores[0];
    if (bu && store) {
      businessUnitKey = bu.key;
      storeKey = store.key;
      const channels = await getStoreChannelData(store.key);
      storeId = channels.storeId;
      supplyChannelId = channels.supplyChannelId;
      distributionChannelId = channels.distributionChannelId;
      productSelectionId = channels.productSelectionId;
    }
  } catch {
    // No accessible business unit — log in without B2B context.
  }

  const session: Session = {
    ...prior,
    customerId: customer.id,
    customerEmail: customer.email,
    customerFirstName: customer.firstName,
    customerLastName: customer.lastName,
    businessUnitKey,
    storeKey,
    storeId,
    supplyChannelId,
    distributionChannelId,
    productSelectionId,
  };

  return jsonWithSession(
    {
      user: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    },
    session
  );
}
