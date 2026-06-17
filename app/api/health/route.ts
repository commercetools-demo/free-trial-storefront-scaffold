// Connection health check — verify commercetools credentials. DELETE before deploying.
import { NextResponse } from 'next/server';
import { apiRoot } from '@/lib/ct/client';

export async function GET() {
  try {
    const { body } = await apiRoot.get().execute();
    return NextResponse.json({ ok: true, projectKey: body.key });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
