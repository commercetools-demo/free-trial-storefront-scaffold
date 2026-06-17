export const KEY_CART = 'cart';
export const KEY_ACCOUNT = 'account';
export const KEY_ORDERS = 'orders';
export const KEY_ADDRESSES = 'addresses';
export const KEY_BUSINESS_UNIT = 'business-unit';
export const KEY_BUSINESS_UNITS = 'business-units';
export const KEY_ASSOCIATE_ROLES = 'associate-roles';
export const KEY_APPROVAL_RULES = 'approval-rules';
export const KEY_APPROVAL_FLOWS = 'approval-flows';
export const KEY_PURCHASE_LISTS = 'purchase-lists';
export const KEY_QUOTE_REQUESTS = 'quote-requests';
export const KEY_QUOTES = 'quotes';
export function keyOrder(id: string) { return `order-${id}`; }
export function keyPurchaseList(id: string) { return `purchase-list-${id}`; }
export function keyQuote(id: string) { return `quote-${id}`; }
export function keyApprovalFlow(id: string) { return `approval-flow-${id}`; }
