import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getWishlistById, addWishlistItem, removeWishlistItem } from '@/lib/ct/wishlists';
import { mapWishlist } from '@/lib/mappers/wishlist';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/wishlist/[id]/items — add { productId, variantId, quantity }
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await getWishlistById(id, session.customerId);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { productId, variantId, quantity } = await req.json();
  if (!productId || !variantId) {
    return NextResponse.json({ error: 'productId and variantId required' }, { status: 400 });
  }
  const updated = await addWishlistItem(id, existing.version, productId, variantId, quantity ?? 1);
  return NextResponse.json({ wishlist: mapWishlist(updated, locale) });
}

// DELETE /api/wishlist/[id]/items — remove { lineItemId }
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const session = await getSession();
  const { locale } = await getLocale();
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await getWishlistById(id, session.customerId);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { lineItemId } = await req.json();
  if (!lineItemId) return NextResponse.json({ error: 'lineItemId required' }, { status: 400 });
  const updated = await removeWishlistItem(id, existing.version, lineItemId);
  return NextResponse.json({ wishlist: mapWishlist(updated, locale) });
}
