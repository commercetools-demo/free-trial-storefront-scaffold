# My Brand — commercetools B2C storefront

A production-ready B2C storefront built on **Next.js 16** (App Router) + **commercetools**.
Connected to project `us-store` (region `us-central1.gcp`).

## Stack

- Next.js 16 (App Router, Turbopack), React 19
- next-intl v4 (locale routing: `en-US`, `en-GB`, `de-DE`)
- Tailwind v4 (CSS-first `@theme` in `app/globals.css`)
- SWR (client state) + `jose` (signed-JWT session)
- commercetools TypeScript SDK (`@commercetools/platform-sdk` + `ts-client`)
- commercetools Checkout Browser SDK (`paymentFlow`)

## Architecture (BFF)

The app is its own Backend-for-Frontend. The browser never calls commercetools directly.

```
Browser component → hooks/* (SWR) → app/api/* (Route Handler / BFF)
  → lib/ct/* (server-only) → lib/mappers/* → apiRoot → commercetools
```

- `lib/ct/client.ts` — single `apiRoot` (client-credentials). Server-only.
- `lib/session.ts` — signed-JWT session in the HTTP-only `my-brand-session` cookie.
- `lib/mappers/*` — map SDK responses to the domain types in `lib/types.ts`. Components
  only ever import from `lib/types.ts`, never the SDK.
- Catalog data (home, PLP, PDP, search) is **server-rendered**. Cart / account / wishlist are
  **client-fetched** via SWR.
- `proxy.ts` handles locale-prefix routing and keeps the `your-shop-country-locale` cookie in
  sync with the URL so server-side price selection follows the active locale/currency.

## Features

| Feature | Route(s) |
|---|---|
| Home | `/[locale]` |
| Product listing + facets | `/[locale]/category/[slug]` |
| Product detail (variant selectors, gallery) | `/[locale]/product/[sku]` |
| Full-text search + facets | `/[locale]/search?q=` |
| Cart + mini-cart | `/[locale]/cart` |
| Checkout (paymentFlow) | `/[locale]/checkout/{addresses,shipping,payment,confirmation}` |
| Auth (login / register) | `/[locale]/login`, `/[locale]/register` |
| Account + orders | `/[locale]/account`, `/[locale]/account/orders` |
| Wishlists | `/[locale]/wishlists`, `/[locale]/wishlists/[id]` |

Facets are derived from product-type attribute definitions (`isSearchable`) and translated to a
commercetools `postFilter` via `f_*` URL params. The Product Search API
(`apiRoot.products().search()`) is used throughout — never the deprecated `productProjections`.

## Environment

Set these in `.env` (already present locally, git-ignored):

```
CTP_PROJECT_KEY=us-store
CTP_AUTH_URL=https://auth.us-central1.gcp.commercetools.com
CTP_API_URL=https://api.us-central1.gcp.commercetools.com
CTP_CLIENT_ID=...
CTP_CLIENT_SECRET=...
CTP_SCOPES=manage_project:us-store
SESSION_SECRET=<random string ≥ 32 chars>
```

No `NEXT_PUBLIC_` prefixes — all commercetools credentials are server-only.

## Checkout (paymentFlow)

The payment step mounts the commercetools Checkout widget in **payment-only** (`paymentFlow`)
mode. The Checkout Application key is kept as a constant in
`app/api/checkout/session/route.ts`:

```ts
const APP_KEY = 'storefront-checkout';
```

For **live** payments you must, in Merchant Center → Checkout:
1. Create a Checkout Application with key `storefront-checkout`.
2. Attach a PSP connector (Stripe, Adyen, Mollie, …) and register a `paymentReturnUrl`.

The session-creation endpoint and widget integration are fully wired; the only external
prerequisite is the Checkout Application + PSP connector configuration above.

## Commands

```
npm run dev      # dev server (Turbopack)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```
