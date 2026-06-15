import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getWishlistById, addWishlistItem, removeWishlistItem } from '@/lib/ct/wishlists';
import { mapWishlist } from '@/lib/mappers/wishlist';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { productId, variantId, quantity = 1 } = await req.json();
  const list = await getWishlistById(id, session.customerId);
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await addWishlistItem(id, list.version, productId, variantId ?? 1, quantity);
  return NextResponse.json({ wishlist: mapWishlist(updated, locale) });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { lineItemId } = await req.json();
  const list = await getWishlistById(id, session.customerId);
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await removeWishlistItem(id, list.version, lineItemId);
  return NextResponse.json({ wishlist: mapWishlist(updated, locale) });
}
