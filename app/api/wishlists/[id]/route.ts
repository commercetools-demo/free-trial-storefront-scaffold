import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getWishlistById, renameWishlist, deleteWishlist } from '@/lib/ct/wishlists';
import { mapWishlist } from '@/lib/mappers/wishlist';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const list = await getWishlistById(id, session.customerId);
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ wishlist: mapWishlist(list, locale) });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { name } = await req.json();
  const list = await getWishlistById(id, session.customerId);
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await renameWishlist(id, list.version, locale, name);
  return NextResponse.json({ wishlist: mapWishlist(updated, locale) });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  if (!session.customerId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const list = await getWishlistById(id, session.customerId);
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteWishlist(id, list.version);
  return NextResponse.json({ success: true });
}
