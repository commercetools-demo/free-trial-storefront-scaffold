import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getWishlists, createWishlist } from '@/lib/ct/wishlists';
import { mapWishlist } from '@/lib/mappers/wishlist';

export async function GET() {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ wishlists: [] });
  try {
    const lists = await getWishlists(session.customerId);
    return NextResponse.json({ wishlists: lists.map((l) => mapWishlist(l, locale)) });
  } catch {
    return NextResponse.json({ wishlists: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { name } = await req.json();
  try {
    const list = await createWishlist(session.customerId, locale, name || 'My Wishlist');
    return NextResponse.json({ wishlist: mapWishlist(list, locale) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
