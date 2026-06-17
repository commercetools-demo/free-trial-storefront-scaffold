export interface Price {
  centAmount: number;
  currencyCode: string;
  discounted?: { centAmount: number; currencyCode: string; discountName?: string };
}

export interface ProductAttribute {
  name: string;
  value: unknown;
}

export interface Variant {
  id: number;
  sku: string;
  images: string[];
  price?: Price;
  prices: Price[];
  attributes: ProductAttribute[];
  availability?: { isOnStock?: boolean };
  isMatching?: boolean;
}

export interface Product {
  type: 'Product';
  id: string;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  categories: Array<{ id: string }>;
  variants: Variant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: { id: string };
  children?: Category[];
  orderHint?: string;
}

export interface Address {
  id?: string;
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  additionalStreetInfo?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  state?: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface CartLineItem {
  id: string;
  productId: string;
  variantId: number;
  name: string;
  slug?: string;
  sku?: string;
  image?: string;
  quantity: number;
  unitPrice: Price;
  totalPrice: { centAmount: number; currencyCode: string };
}

export interface Cart {
  id: string;
  version: number;
  lineItems: CartLineItem[];
  totalPrice: { centAmount: number; currencyCode: string };
  subtotal: { centAmount: number; currencyCode: string };
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingInfo?: { methodName: string; price: { centAmount: number; currencyCode: string } } | null;
  discountCodes: Array<{ id: string; code: string; state: string }>;
  totalLineItemQuantity: number;
  currency: string;
  country?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: { centAmount: number; currencyCode: string };
  isDefault: boolean;
}

export interface OrderSummary {
  id: string;
  orderNumber?: string;
  createdAt: string;
  state: string;
  totalPrice: { centAmount: number; currencyCode: string };
  lineItems: CartLineItem[];
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  addresses?: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface WishlistLineItem {
  lineItemId: string;
  productId: string;
  variantId: number;
  quantity: number;
  name: string;
  slug?: string;
  image?: string;
  price?: Price;
}

export interface Wishlist {
  id: string;
  version: number;
  name: string;
  lineItems: WishlistLineItem[];
}

// ---- Facets ----
export type FacetKind = 'distinct' | 'ranges';

export interface FacetBucket {
  key: string;
  label: string;
  count: number;
}

export interface FacetResult {
  name: string;
  kind: FacetKind;
  buckets: FacetBucket[];
}
