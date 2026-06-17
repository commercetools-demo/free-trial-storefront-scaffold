import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getWishlistById, renameWishlist, deleteWishlist } from '@/lib/ct/wishlists';
import { mapWishlist } from '@/lib/mappers/wishlist';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/wishlist/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const list = await getWishlistById(id, session.customerId);
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ wishlist: mapWishlist(list, locale) });
}

// PUT /api/wishlist/[id] — rename { name }
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await getWishlistById(id, session.customerId);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { name } = await req.json();
  const updated = await renameWishlist(id, existing.version, name, locale);
  return NextResponse.json({ wishlist: mapWishlist(updated, locale) });
}

// DELETE /api/wishlist/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await getWishlistById(id, session.customerId);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteWishlist(id, existing.version);
  return NextResponse.json({ ok: true });
}
