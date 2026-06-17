import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { listWishlists, createWishlist } from '@/lib/ct/wishlists';
import { mapWishlist } from '@/lib/mappers/wishlist';

// GET /api/wishlist — all of the current customer's wishlists
export async function GET() {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const lists = await listWishlists(session.customerId);
    return NextResponse.json({ wishlists: lists.map((l) => mapWishlist(l, locale)) });
  } catch {
    return NextResponse.json({ wishlists: [] });
  }
}

// POST /api/wishlist — create a wishlist { name }
export async function POST(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name } = await req.json();
  try {
    const list = await createWishlist(session.customerId, name || 'My Wishlist', locale);
    return NextResponse.json({ wishlist: mapWishlist(list, locale) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create wishlist';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
