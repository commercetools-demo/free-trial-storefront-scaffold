// ---------------------------------------------------------------------------
// Catalog / product types (app boundary — mapped in lib/mappers/*)
// ---------------------------------------------------------------------------

export interface Price {
  centAmount: number;
  currencyCode: string;
  discounted?: { centAmount: number; currencyCode: string };
}

export interface ProductImage {
  url: string;
  label?: string;
}

export interface VariantAttribute {
  name: string;
  value: unknown;
}

export interface Variant {
  id: number;
  sku: string;
  images: string[];
  price?: Price;
  prices: Price[];
  attributes: VariantAttribute[];
  availability?: { isOnStock?: boolean; availableQuantity?: number };
}

export interface Product {
  type: 'Product';
  id: string;
  name: string;
  slug: string;
  description?: string;
  categories: Array<{ id: string }>;
  variants: Variant[];
  /** ids of variants that matched the search query, when applicable */
  matchingVariantIds?: number[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: { id: string };
  children?: Category[];
}

export interface FacetTerm {
  term: string;
  count: number;
  label?: string;
}

export interface Facet {
  field: string;
  label: string;
  type: 'terms' | 'range';
  terms: FacetTerm[];
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  offset: number;
  limit: number;
  facets: Facet[];
}

// ---------------------------------------------------------------------------
// Cart types
// ---------------------------------------------------------------------------

export interface CartLineItem {
  id: string;
  productId: string;
  variantId: number;
  name: string;
  slug?: string;
  sku?: string;
  quantity: number;
  image?: string;
  unitPrice: Price;
  totalPrice: { centAmount: number; currencyCode: string };
}

export interface Address {
  id?: string;
  key?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  streetName?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  state?: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Cart {
  id: string;
  version: number;
  lineItems: CartLineItem[];
  totalPrice: { centAmount: number; currencyCode: string };
  currency: string;
  country?: string;
  customerId?: string;
  businessUnitKey?: string;
  storeKey?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingInfo?: { shippingMethodName?: string; price?: { centAmount: number; currencyCode: string } } | null;
  itemCount: number;
}

// ---------------------------------------------------------------------------
// B2B — Business unit, associates, permissions
// ---------------------------------------------------------------------------

export type Permission =
  // Business Unit
  | 'AddChildUnits'
  | 'UpdateBusinessUnitDetails'
  | 'UpdateAssociates'
  // Carts
  | 'CreateMyCarts' | 'CreateOthersCarts'
  | 'UpdateMyCarts' | 'UpdateOthersCarts'
  | 'DeleteMyCarts' | 'DeleteOthersCarts'
  | 'ViewMyCarts' | 'ViewOthersCarts'
  // Orders
  | 'CreateMyOrdersFromMyCarts' | 'CreateOrdersFromOthersCarts'
  | 'CreateMyOrdersFromMyQuotes' | 'CreateOrdersFromOthersQuotes'
  | 'ViewMyOrders' | 'ViewOthersOrders'
  | 'UpdateMyOrders' | 'UpdateOthersOrders'
  // Quotes
  | 'CreateMyQuoteRequestsFromMyCarts' | 'CreateQuoteRequestsFromOthersCarts'
  | 'AcceptMyQuotes' | 'AcceptOthersQuotes'
  | 'DeclineMyQuotes' | 'DeclineOthersQuotes'
  | 'RenegotiateMyQuotes' | 'RenegotiateOthersQuotes'
  | 'ReassignMyQuotes' | 'ReassignOthersQuotes'
  | 'ViewMyQuotes' | 'ViewOthersQuotes'
  // Approvals
  | 'CreateApprovalRules'
  | 'UpdateApprovalRules'
  | 'UpdateApprovalFlows'
  // Shopping lists (purchase lists)
  | 'ViewMyShoppingLists' | 'ViewOthersShoppingLists'
  | 'CreateMyShoppingLists' | 'CreateOthersShoppingLists'
  | 'UpdateMyShoppingLists' | 'UpdateOthersShoppingLists'
  | 'DeleteMyShoppingLists' | 'DeleteOthersShoppingLists';

export interface AssociateRoleAssignment {
  associateRoleKey: string;
}

export interface Associate {
  customerId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleKeys: string[];
}

export interface BusinessUnitStoreRef {
  key: string;
  name?: string;
}

export interface BusinessUnit {
  id: string;
  version: number;
  key: string;
  name: string;
  unitType: 'Company' | 'Division';
  status?: string;
  contactEmail?: string;
  associateCount: number;
  associates: Associate[];
  stores: BusinessUnitStoreRef[];
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  parentUnit?: { key: string };
}

export interface AssociateRole {
  id: string;
  key: string;
  name?: string;
  permissions: string[];
}

// ---------------------------------------------------------------------------
// B2B — Approval rules & flows
// ---------------------------------------------------------------------------

/**
 * Approver hierarchy as a sequential list of tiers. Each tier is a list of
 * associate-role keys; ANY of those roles can approve that tier (OR), and ALL
 * tiers must approve in order (AND).
 */
export interface ApprovalRule {
  id: string;
  version: number;
  key?: string;
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  predicate: string;
  approverTiers: string[][];
  requesterRoleKeys: string[];
}

export interface ApprovalFlow {
  id: string;
  version: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  orderId: string;
  orderNumber?: string;
  businessUnitKey: string;
  total?: { centAmount: number; currencyCode: string };
  rules: Array<{ id: string; name: string }>;
  currentTierPendingApproverRoleKeys: string[];
  eligibleApproverRoleKeys: string[];
  pendingApproverRoleKeys: string[];
  approvals: Array<{ approverCustomerId: string; approvedAt: string }>;
  rejection?: { reason?: string; rejecterCustomerId: string; rejectedAt: string };
  createdAt: string;
}

// ---------------------------------------------------------------------------
// B2B — Purchase lists (shopping lists)
// ---------------------------------------------------------------------------

export interface PurchaseListItem {
  id: string;
  productId: string;
  variantId?: number;
  name: string;
  sku?: string;
  quantity: number;
  image?: string;
}

export interface PurchaseList {
  id: string;
  version: number;
  name: string;
  description?: string;
  itemCount: number;
  items: PurchaseListItem[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// B2B — Quotes
// ---------------------------------------------------------------------------

/** A single Quote round within a negotiation thread. */
export interface QuoteRound {
  quoteId: string;
  quoteVersion: number;
  quoteState: string;
  sellerComment?: string;
  buyerComment?: string;
  validTo?: string;
  createdAt: string;
}

export interface QuoteThread {
  /** thread id = originating quote-request id */
  id: string;
  quoteRequestId: string;
  quoteRequestState: string;
  quoteRequestComment?: string;
  /** the most recent Quote round's id, when a quote has been issued */
  latestQuoteId?: string;
  /** effective state for display (latest quote state, else quote-request state) */
  effectiveState: string;
  customerId: string;
  businessUnitKey?: string;
  totalPrice?: { centAmount: number; currencyCode: string };
  itemCount: number;
  lineItems: CartLineItem[];
  rounds: QuoteRound[];
  createdAt: string;
  lastModifiedAt: string;
}

// ---------------------------------------------------------------------------
// Session (B2B)
// ---------------------------------------------------------------------------

export interface SessionData {
  // Auth
  customerId?: string;
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;

  // Active cart
  cartId?: string;

  // B2B context — resolved from the active store at login / BU-select
  businessUnitKey?: string;
  storeKey?: string;
  storeId?: string;
  supplyChannelId?: string;
  distributionChannelId?: string;
  productSelectionId?: string;

  /** Customer group ids for priceCustomerGroupAssignments in product search */
  accountGroupIds?: string[];

  // Locale (always write all three together)
  locale?: string;
  currency?: string;
  country?: string;
}
