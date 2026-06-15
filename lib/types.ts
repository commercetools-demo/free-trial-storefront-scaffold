// App-facing domain types. Components import from here — never from @commercetools/platform-sdk.

export interface Money {
  centAmount: number;
  currencyCode: string;
  fractionDigits?: number;
}

export interface Price {
  value: Money;
  discounted?: {
    value: Money;
    discountName?: string;
  };
}

export interface VariantAttribute {
  name: string;
  value: unknown;
}

export interface Variant {
  id: number;
  sku?: string;
  images: string[];
  price?: Price;
  prices: Price[];
  attributes: VariantAttribute[];
  isOnStock: boolean;
  isMatching?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  categories: Array<{ id: string }>;
  masterVariant: Variant;
  variants: Variant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: { id: string };
  children: Category[];
  orderHint?: string;
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
  unitPrice: Money;
  totalPrice: Money;
}

export interface CartAddress {
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  state?: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface CartShippingInfo {
  shippingMethodName: string;
  price: Money;
  shippingMethodId?: string;
}

export interface DiscountCodeInfo {
  id: string;
  code: string;
  name?: string;
}

export interface Cart {
  id: string;
  version: number;
  lineItems: CartLineItem[];
  totalPrice: Money;
  subtotal: Money;
  totalLineItemQuantity: number;
  shippingAddress?: CartAddress;
  billingAddress?: CartAddress;
  shippingInfo?: CartShippingInfo;
  discountCodes: DiscountCodeInfo[];
  cartState?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: Money;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  addresses: Array<CartAddress & { id?: string }>;
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface OrderLineItem {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  totalPrice: Money;
}

export interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  orderState?: string;
  lineItems: OrderLineItem[];
  totalPrice: Money;
  shippingAddress?: CartAddress;
}

export interface WishlistItem {
  lineItemId: string;
  productId: string;
  variantId: number;
  quantity: number;
  name: string;
  slug?: string;
  sku?: string;
  image?: string;
  price?: Money;
}

export interface Wishlist {
  id: string;
  version: number;
  name: string;
  lineItems: WishlistItem[];
}

export interface SearchFacetBucket {
  key: string;
  count: number;
  label?: string;
}

export interface SearchFacet {
  name: string;
  label: string;
  kind: 'distinct' | 'ranges';
  field: string;
  fieldType: string;
  buckets: SearchFacetBucket[];
}

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  offset: number;
  limit: number;
  facets: SearchFacet[];
}
